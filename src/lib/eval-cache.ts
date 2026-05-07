import { db } from "./supabase";

export async function getCached(hash: string): Promise<unknown | null> {
  const { data, error } = await db
    .from("eval_cache")
    .select("result")
    .eq("hash", hash)
    .maybeSingle();

  if (error) {
    console.error("eval_cache read error:", error.message);
    return null;
  }
  return data?.result ?? null;
}

// Fire-and-forget — caller does not need to await this.
export function setCached(hash: string, result: unknown): void {
  db.from("eval_cache")
    .insert({ hash, result })
    .then(({ error }) => {
      // 23505 = unique_violation (duplicate hash — already cached by a concurrent request)
      if (error && error.code !== "23505") {
        console.error("eval_cache write error:", error.message);
      }
    });
}
