import { db } from "./supabase";

export async function getCached(hash: string): Promise<unknown | null> {
  const { data, error } = await db
    .from("eval_cache")
    .select("result")
    .eq("hash", hash)
    .maybeSingle();

  if (error) {
    console.error("[eval-cache] read error:", error.message);
    return null;
  }
  return data?.result ?? null;
}

/**
 * Upserts the result (first-writer-wins — ON CONFLICT DO NOTHING), then reads
 * back whatever is stored. Concurrent cold starts racing on the same hash will
 * all converge to the same canonical value from the DB rather than each
 * returning their own AI result.
 */
export async function setCachedAndRead(hash: string, result: unknown): Promise<unknown> {
  await db
    .from("eval_cache")
    .upsert({ hash, result }, { onConflict: "hash", ignoreDuplicates: true });

  const { data, error } = await db
    .from("eval_cache")
    .select("result")
    .eq("hash", hash)
    .single();

  if (error || !data) {
    console.error("[eval-cache] canonical read error:", error?.message);
    return result; // fall back to our own result only if the DB read fails
  }
  return data.result;
}
