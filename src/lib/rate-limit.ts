import { db } from "./supabase";

const PER_IP_LIMIT = 10;   // max requests per IP per hour
const DAILY_CAP    = 200;  // max total requests per day (shared across all IPs)
const WINDOW_MS    = 60 * 60 * 1000;       // 1 hour
const DAY_MS       = 24 * 60 * 60 * 1000;  // 24 hours

// type param is for future use — after the DB migration adds a `type` column,
// queries will filter by type so evaluate and convention buckets are independent.
export async function checkRateLimit(
  ip: string,
  type: "evaluate" | "convention" = "evaluate"
): Promise<{ allowed: boolean; reason?: string }> {
  const now     = new Date();
  const hourAgo = new Date(now.getTime() - WINDOW_MS).toISOString();
  const dayAgo  = new Date(now.getTime() - DAY_MS).toISOString();

  const [perIpResult, dailyResult] = await Promise.all([
    db.from("rate_limits").select("*", { count: "exact", head: true }).eq("ip", ip).eq("type", type).gte("created_at", hourAgo),
    db.from("rate_limits").select("*", { count: "exact", head: true }).eq("type", type).gte("created_at", dayAgo),
  ]);

  const perIpCount = perIpResult.count ?? 0;
  const dailyCount = dailyResult.count ?? 0;

  if (perIpCount >= PER_IP_LIMIT) {
    return { allowed: false, reason: `Rate limit exceeded. You can run up to ${PER_IP_LIMIT} evaluations per hour.` };
  }
  if (dailyCount >= DAILY_CAP) {
    return { allowed: false, reason: "Daily evaluation limit reached. Please try again tomorrow." };
  }

  // Fire-and-forget — don't block the response on this write.
  db.from("rate_limits").insert({ ip, type }).then(() => {});

  return { allowed: true };
}
