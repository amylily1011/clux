import { NextRequest, NextResponse } from "next/server";
import { EvaluationRequestSchema } from "@/lib/schema";
import { evaluateByName, evaluateByContent } from "@/lib/ai";

// ── Rate limiting ────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

// ── URL security ─────────────────────────────────────────────────────────────

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^::1$/,
  /^metadata\.google\.internal$/i,
  /^169\.254\./,            // AWS/GCP metadata
];

function isSafeUrl(raw: string): { safe: boolean; reason?: string } {
  let url: URL;
  try { url = new URL(raw); }
  catch { return { safe: false, reason: "Invalid URL format." }; }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { safe: false, reason: "Only http and https URLs are allowed." };
  }

  const host = url.hostname.toLowerCase();
  if (BLOCKED_HOSTS.some((pattern) => pattern.test(host))) {
    return { safe: false, reason: "That URL points to a private or internal address." };
  }

  return { safe: true };
}

// ── Content sanitisation (basic prompt-injection mitigation) ──────────────────

function sanitizeContent(text: string): string {
  return text
    // Strip anything that looks like a system/instruction override
    .replace(/\[SYSTEM\]/gi, "[blocked]")
    .replace(/\bignore\s+(all\s+)?(previous|above|prior)\s+instructions?\b/gi, "[blocked]")
    .replace(/you\s+are\s+now\s+a/gi, "[blocked]")
    .replace(/new\s+instructions?:/gi, "[blocked]")
    .replace(/---+\s*(system|prompt|instruction)/gi, "[blocked]")
    // Collapse excessive whitespace
    .replace(/\s{3,}/g, "\n\n")
    .trim()
    .slice(0, 12000);
}

// ── Jina AI Reader (sandboxed URL fetching) ───────────────────────────────────

async function fetchViaJina(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      "Accept": "text/plain",
      "User-Agent": "CLUX-Evaluator/1.0",
      "X-No-Cache": "true",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Jina fetch failed: ${res.status}`);
  const text = await res.text();
  return sanitizeContent(text);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. You can run up to 10 evaluations per hour." },
      { status: 429 }
    );
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
        if (!check.safe) {
          return NextResponse.json({ error: check.reason }, { status: 400 });
        }
        try {
          docsContent = await fetchViaJina(data.docsUrl);
        } catch {
          // Non-fatal — evaluate without docs and surface a warning
          console.warn("Docs URL fetch failed, proceeding without it:", data.docsUrl);
        }
      }

      result = await evaluateByName(data.cliName, data.audience, docsContent);

    } else {
      result = await evaluateByContent(sanitizeContent(data.cliText), data.audience);
    }

    return NextResponse.json({ ...result, audience: data.audience });

  } catch (err) {
    console.error("Evaluation error:", err);
    return NextResponse.json(
      { error: "Evaluation failed. Please try again." },
      { status: 500 }
    );
  }
}
