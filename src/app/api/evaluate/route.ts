import { NextRequest, NextResponse } from "next/server";
import { EvaluationRequestSchema } from "@/lib/schema";
import { evaluateByName, evaluateByContent, evaluateByConvention } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { isAllowedOrigin } from "@/lib/origin";
import { isSafeUrl, fetchViaJina } from "@/lib/url";
import { sanitizeContent } from "@/lib/sanitize";

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, reason } = await checkRateLimit(ip, "evaluate");
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 429 });
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

    if (data.inputMode === "name") {
      let docsContent: string | undefined;
      if (data.docsUrl) {
        const check = isSafeUrl(data.docsUrl);
        if (!check.safe) return NextResponse.json({ error: check.reason }, { status: 400 });
        try {
          docsContent = await fetchViaJina(data.docsUrl);
        } catch {
          console.warn("Docs URL fetch failed, proceeding without it:", data.docsUrl);
        }
      }
      result = await evaluateByName(data.cliName, data.audience, docsContent);

    } else if (data.inputMode === "paste") {
      result = await evaluateByContent(sanitizeContent(data.cliText), data.audience);

    } else {
      result = await evaluateByConvention(
        sanitizeContent(data.conventionRules),
        sanitizeContent(data.cliText),
        data.audience
      );

      if (result.complianceItems && result.complianceItems.length > 0) {
        const total  = result.complianceItems.length;
        const passed = result.complianceItems.filter((i: { passed: boolean }) => i.passed).length;
        const failed = total - passed;
        const countSentence =
          failed === 0
            ? `All ${total} org rules pass.`
            : `${passed} of ${total} org rule${total > 1 ? "s" : ""} pass${passed === 1 ? "es" : ""}, ${failed} fail${failed === 1 ? "s" : ""}.`;
        const rest = result.overallSummary.replace(/^[^.!?]+[.!?]\s*/, "");
        result = { ...result, overallSummary: `${countSentence}${rest ? " " + rest : ""}` };
      }
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
