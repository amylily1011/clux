import { sanitizeContent } from "./sanitize";

const BLOCKED_HOSTS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^0\./,
  /^::1$/,
  /^metadata\.google\.internal$/i,
  /^169\.254\./,
];

export function isSafeUrl(raw: string): { safe: boolean; reason?: string } {
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

// Converts github.com/.../blob/... URLs to raw.githubusercontent.com so Jina
// gets the file content instead of the rendered HTML page.
export function toRawUrl(url: string): string {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/(.+)$/);
  if (match) return `https://raw.githubusercontent.com/${match[1]}/${match[2]}`;
  return url;
}

export async function fetchViaJina(url: string): Promise<string> {
  const res = await fetch(`https://r.jina.ai/${toRawUrl(url)}`, {
    headers: {
      "Accept": "text/plain",
      "User-Agent": "CLUX-Evaluator/1.0",
      "X-No-Cache": "true",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Jina fetch failed: ${res.status}`);
  return sanitizeContent(await res.text());
}
