import { NextRequest } from "next/server";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export function isAllowedOrigin(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;

  const origin  = req.headers.get("origin")  ?? "";
  const referer = req.headers.get("referer") ?? "";
  const check   = origin || referer;

  if (!check) return false;

  return ALLOWED_ORIGINS.some((allowed) => check.startsWith(allowed));
}
