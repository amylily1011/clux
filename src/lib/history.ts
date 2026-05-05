import type { EvaluationResult, InputMode } from "@/types/evaluation";

export interface HistoryItem {
  id: string;
  cliName: string;
  score: number;
  inputMode: InputMode;
  createdAt: number;
  result: EvaluationResult;
}

const KEY = "clux_history";
const MAX = 20;

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(item: HistoryItem): void {
  if (typeof window === "undefined") return;
  try {
    const items = loadHistory().filter((h) => h.id !== item.id);
    const next = [item, ...items].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function removeFromHistory(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = loadHistory().filter((h) => h.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}
