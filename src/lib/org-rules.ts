const KEY = "clux:org-rules";

export interface SavedOrgRules {
  text: string;
  savedAt: number;
}

export function loadOrgRules(): SavedOrgRules | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedOrgRules) : null;
  } catch { return null; }
}

export function saveOrgRules(text: string): void {
  localStorage.setItem(KEY, JSON.stringify({ text, savedAt: Date.now() }));
}

export function clearOrgRules(): void {
  localStorage.removeItem(KEY);
}
