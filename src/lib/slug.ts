const ADJECTIVES = ["amber", "bold", "calm", "dark", "epic", "fast", "glad", "hard", "iron", "keen", "lean", "mild", "neat", "open", "pure", "rich", "safe", "tall", "vast", "warm"];
const NOUNS      = ["audit", "bench", "check", "draft", "echo", "forge", "guard", "hawk", "index", "judge", "knack", "lance", "match", "node", "orbit", "probe", "quest", "rover", "scout", "track"];

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$/;

export function generateSlug(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const hex  = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `${adj}-${noun}-${hex}`;
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export function suggestAlternative(slug: string): string {
  const match = slug.match(/^(.+)-(\d+)$/);
  if (match) return `${match[1]}-${Number(match[2]) + 1}`;
  return `${slug}-2`;
}
