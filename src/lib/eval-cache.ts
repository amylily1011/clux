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

function countUnverified(result: unknown): number {
  const r = result as { complianceItems?: { passed?: boolean; note?: string }[] };
  return (r?.complianceItems ?? []).filter(
    (i) => i.passed && i.note?.toLowerCase().includes("could not verify")
  ).length;
}

/**
 * Writes result to cache, preferring the richer result when one already exists.
 * "Richer" means fewer unverified compliance items — i.e. more rules resolved.
 * If the new result has fewer unverified items than what's cached, update the cache.
 * All concurrent callers converge to the same canonical (best) result.
 */
export async function setCachedAndRead(hash: string, result: unknown): Promise<unknown> {
  // Try initial insert (no-op if already exists).
  await db
    .from("eval_cache")
    .upsert({ hash, result }, { onConflict: "hash", ignoreDuplicates: true });

  // Read back whatever is stored now.
  const { data, error } = await db
    .from("eval_cache")
    .select("result")
    .eq("hash", hash)
    .single();

  if (error || !data) {
    console.error("[eval-cache] canonical read error:", error?.message);
    return result;
  }

  const existing = data.result;

  // If the newly computed result is richer (fewer unverified items), overwrite.
  if (countUnverified(result) < countUnverified(existing)) {
    const { data: updated, error: updateErr } = await db
      .from("eval_cache")
      .update({ result })
      .eq("hash", hash)
      .select("result")
      .single();

    if (!updateErr && updated) return updated.result;
  }

  return existing;
}
