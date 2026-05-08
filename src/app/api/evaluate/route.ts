import { NextRequest, NextResponse } from "next/server";
import { EvaluationRequestSchema } from "@/lib/schema";
import { evaluateByConvention, evaluateByUnix } from "@/lib/ai";
import { UNIX_RULES } from "@/lib/unix-rules";
import { checkRateLimit } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/origin";
import { sanitizeContent } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (process.env.NODE_ENV !== "development") {
    const { allowed, reason } = await checkRateLimit(ip, "evaluate");
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 429 });
    }
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const parsed = EvaluationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    let result;

    const hasOrgRules = !!data.conventionRules && data.conventionRules.trim().length >= 10;

    if (hasOrgRules) {
      result = await evaluateByConvention(
        sanitizeContent(data.conventionRules!),
        sanitizeContent(data.cliText),
        data.audience,
        false,
        UNIX_RULES,
      );

      const orgItems = (result.complianceItems ?? []).filter((i: { type?: string }) => i.type === "org");
      if (orgItems.length > 0) {
        const isUnverified = (i: { passed: boolean; note?: string }) =>
          i.passed && !!i.note?.toLowerCase().includes("could not verify");
        const total      = orgItems.length;
        const unverified = orgItems.filter(isUnverified).length;
        const passed     = orgItems.filter((i) => i.passed && !isUnverified(i)).length;
        const failed     = orgItems.filter((i) => !i.passed).length;
        const parts: string[] = [];
        if (passed > 0)     parts.push(`${passed} pass${passed === 1 ? "es" : ""}`);
        if (unverified > 0) parts.push(`${unverified} unverified`);
        if (failed > 0)     parts.push(`${failed} fail${failed === 1 ? "s" : ""}`);
        const countSentence = `${total} org rule${total > 1 ? "s" : ""}: ${parts.join(", ")}.`;
        const rest = result.overallSummary.replace(/^[^.!?]+[.!?]\s*/, "");
        result = { ...result, overallSummary: `${countSentence}${rest ? " " + rest : ""}` };
      }
    } else {
      result = await evaluateByUnix(sanitizeContent(data.cliText), data.audience);
    }

    return NextResponse.json({ ...result, audience: data.audience });

  } catch (err) {
    console.error("Evaluation error:", err);
    const message = err instanceof Error ? err.message : String(err);

    let userError = "Evaluation failed. Please try again.";
    if (message.includes("API key") || message.includes("api_key") || message.includes("401") || message.includes("403")) {
      userError = "Invalid or missing API key. Check your AI provider credentials.";
    } else if (message.includes("429") || message.includes("quota") || message.includes("rate")) {
      userError = "AI provider rate limit hit. Wait a moment and try again.";
    } else if (message.includes("timeout") || message.includes("ETIMEDOUT")) {
      userError = "Request timed out. The AI provider took too long to respond.";
    } else if (message.includes("model") || message.includes("404")) {
      userError = "Model not found or unavailable. Check AI_MODEL in your config.";
    } else if (message.includes("JSON") || message.includes("parse")) {
      userError = "The AI returned an unexpected response format. Try again.";
    }

    return NextResponse.json({ error: userError }, { status: 500 });
  }
}
