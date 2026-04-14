# CLUX — CLI UX Evaluator

**Get an AI-powered UX score for any command-line tool.**

Paste your CLI's `--help` output or man page. CLUX evaluates it across 8 heuristic dimensions and gives you a **CLUX Score** — a single number that shows how usable your CLI actually is, and what to fix first.

→ **[Try it live](https://clux.vercel.app)** ← *(update with your Vercel URL)*

---

## What gets evaluated

| Dimension | What it measures |
|---|---|
| 📖 Learnability | Discoverability, help quality, naming clarity |
| ⚠️ Error Tolerance | Error message quality, recovery guidance |
| ⚡ Efficiency | Shortcuts, `--json` output, pipe-friendliness |
| 🛡️ Safety | Protection from destructive ops, `--dry-run` |
| 🐚 UNIX Compliance | Exit codes, stdin/stdout, composability |
| ✨ Pleasantness | Consistent naming, output formatting |
| 🔒 Security | Credential handling, secrets exposure |
| ♿ Accessibility | Color-safe output, `--no-color` flag |

Weights shift based on whether your CLI is **Human-first** or **Scripting-first** — because a confirmation prompt is good UX for humans and a pipeline-breaking bug for scripts.

Based on [Professor Daniel Jackson's usability principles](https://essenceofsoftware.com) + the UNIX philosophy.

---

## Self-host in 2 minutes

```bash
git clone https://github.com/amylily1011/clux
cd clux
npm install
cp .env.example .env.local
# Add your Anthropic API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Get your Anthropic API key at [console.anthropic.com](https://console.anthropic.com).

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amylily1011/clux&env=ANTHROPIC_API_KEY&envDescription=Your%20Anthropic%20API%20key&envLink=https://console.anthropic.com)

---

## How it works

1. Choose whether your CLI targets **humans** or **scripts** — this shifts the evaluation weights
2. Paste your CLI's help text, man page, or error output
3. Claude evaluates it against 8 dimensions using calibrated rubrics
4. Get a radar chart, a CLUX Score, and per-dimension feedback with actionable fixes
5. Share results via URL — no account needed

---

## Roadmap

- [ ] Org CLI guideline comparison (upload your style guide, get a compliance score)
- [ ] CI/CD API — fail builds when CLUX score drops below threshold
- [ ] PDF reports
- [ ] Score tracking over time

Found a bug or have a feature idea? [Open an issue](https://github.com/amylily1011/clux/issues).

---

## Stack

- [Next.js](https://nextjs.org) — full-stack framework
- [Claude](https://anthropic.com) — AI evaluation engine
- [Recharts](https://recharts.org) — radar chart
- [shadcn/ui](https://ui.shadcn.com) — UI components
- [Vercel](https://vercel.com) — deployment
