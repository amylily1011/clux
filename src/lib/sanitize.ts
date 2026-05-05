const MAX_CONTENT_LENGTH = 12000;

export function sanitizeContent(text: string): string {
  return text
    .replace(/\[SYSTEM\]/gi, "[blocked]")
    .replace(/\bignore\s+(all\s+)?(previous|above|prior)\s+instructions?\b/gi, "[blocked]")
    .replace(/you\s+are\s+now\s+a/gi, "[blocked]")
    .replace(/new\s+instructions?:/gi, "[blocked]")
    .replace(/---+\s*(system|prompt|instruction)/gi, "[blocked]")
    .replace(/\s{3,}/g, "\n\n")
    .trim()
    .slice(0, MAX_CONTENT_LENGTH);
}
