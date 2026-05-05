# TODOS

## P0 — do before writing any convention route code

- [x] **Install @supabase/ssr**
- [x] **Rewrite src/lib/supabase.ts** — `db` (anon client) + `makeServerClient()` (cookie-aware, per-request)
- [x] **Extract shared utilities from evaluate/route.ts** — `rate-limit.ts`, `url.ts`, `sanitize.ts`, `origin.ts`. `type` column now active — evaluate/convention buckets are independent.
- [x] **Add Supabase RLS policies** — `convention_rulesets`, `convention_runs`, `run_feedback` created with RLS + policies. `convention_rulesets_slug_idx` and `convention_runs_ruleset_id_idx` indexes applied.
- [x] **Register GitHub OAuth app**

## P1 — do in this PR

- [x] **Add Vitest** — `npm install -D vitest @testing-library/react`. First test targets: ConventionRuleSchema validation, slug generation, PATCH owner check, GitHub URL auto-conversion, ConventionResponseSchema (required complianceItems).
- [x] **Add DB indexes to migration** — `convention_runs_ruleset_id_idx` + `convention_rulesets_slug_idx` applied.
- [x] **Add ConventionResponseSchema to schema.ts** — `complianceItems` required (min 1). Wired into `evaluateByConvention()` — silent empty-report failures now throw at parse time.

## P2 — backlog

- [ ] **Cleanup cron job for orphaned pending runs** — If a Vercel function is killed mid-LLM (after 60s), the stub run stays `pending` forever. Add a cron job that marks runs `failed` if `status = 'pending'` and `created_at < NOW() - INTERVAL '5 minutes'`. Acceptance criteria: <1% of runs stuck in `pending` after 10 min.
- [ ] **Dynamic OG image for audit report** — Static card is fine for v1. In v2: generate an OG image with ruleset name + pass/fail summary using `@vercel/og` or similar.
- [ ] **GitHub Action / PR comment integration (Approach C)** — Post CLUX audit report as a PR comment (informational only, NOT a required status check that blocks merge). Call CLUX evaluate API with a ruleset slug, attach the markdown report as a PR comment. Revisit after team adoption is established.
- [ ] **Public ruleset registry / browse page** — `/explore` directory where teams browse, fork, and adapt each other's rulesets. Requires `is_public` column on `convention_rulesets` to be exposed in UI.
- [ ] **Named org accounts / multi-user management** — Multiple team members under one org, multiple rulesets per account. v2.
- [ ] **Full streaming evaluation response** — If on Vercel Hobby (10s max function duration), replace stub-first pattern with streaming response. Mutually exclusive with `maxDuration: 60` (Vercel Pro only).
