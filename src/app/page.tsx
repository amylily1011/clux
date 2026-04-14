"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CLIInputForm } from "@/components/cli-input-form";
import { ScoreCard } from "@/components/score-card";
import { DimensionFeedback } from "@/components/dimension-feedback";
import { EvaluationResultSchema } from "@/lib/schema";
import { encodeResult, decodeResult } from "@/lib/share";
import type { EvaluationResult } from "@/types/evaluation";

const CLUXRadarChart = dynamic(
  () => import("@/components/radar-chart").then((m) => m.CLUXRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] rounded-lg animate-pulse" style={{ background: "#1a1a1a" }} />
    ),
  }
);

const DIMENSIONS = [
  { icon: "📖", label: "Learnability" },
  { icon: "⚠️", label: "Error Tolerance" },
  { icon: "⚡", label: "Efficiency" },
  { icon: "🛡️", label: "Safety" },
  { icon: "🐚", label: "UNIX Compliance" },
  { icon: "✨", label: "Pleasantness" },
  { icon: "🔒", label: "Security" },
  { icon: "♿", label: "Accessibility" },
];

export default function Home() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const decoded = decodeResult(hash);
      if (decoded) setResult(decoded);
    }
  }, []);

  function handleResult(data: unknown) {
    const parsed = EvaluationResultSchema.safeParse(data);
    if (!parsed.success) {
      setError("Received an unexpected response format. Please try again.");
      return;
    }
    setResult(parsed.data);
    const encoded = encodeResult(parsed.data);
    window.history.replaceState(null, "", `#${encoded}`);
  }

  function handleReset() {
    setResult(null);
    setError("");
    window.history.replaceState(null, "", window.location.pathname);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: "#050507" }}>
      {/* Header */}
      <header
        style={{ borderBottom: "1px solid #3d3a39", background: "#050507" }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-screen-xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-black tracking-tighter glow-emerald"
              style={{ color: "#00d992", fontFamily: "system-ui" }}
            >
              CLUX
            </span>
            <span
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ color: "#8b949e", border: "1px solid #3d3a39", background: "#101010" }}
            >
              CLI UX Evaluator
            </span>
          </div>
          <a
            href="https://github.com/amylily1011/clux"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: "#8b949e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00d992")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {!result ? (
        /* ── Landing ─────────────────────────────────────────────────── */
        <main className="max-w-screen-xl mx-auto px-8 py-20">
          {/* Two-column hero: copy left, form right */}
          <div className="grid grid-cols-2 gap-16 items-start">
            {/* Left — hero copy */}
            <div className="space-y-8 pt-4">
              <div className="space-y-4">
                <p
                  className="text-xs font-mono uppercase"
                  style={{ color: "#00d992", letterSpacing: "2.52px" }}
                >
                  CLI UX Evaluation
                </p>
                <h1
                  className="font-normal leading-none"
                  style={{
                    fontFamily: "system-ui",
                    color: "#f2f2f2",
                    letterSpacing: "-0.65px",
                    lineHeight: 1.0,
                    fontSize: "clamp(2.5rem, 4vw, 3.75rem)",
                  }}
                >
                  Is your CLI actually{" "}
                  <span style={{ color: "#00d992" }}>usable?</span>
                </h1>
                <p className="text-lg leading-relaxed" style={{ color: "#b8b3b0" }}>
                  Paste your CLI&apos;s help text or man page. Get an AI-powered
                  evaluation across 8 heuristic dimensions — and a{" "}
                  <span style={{ color: "#2fd6a1" }} className="font-semibold">
                    CLUX Score
                  </span>{" "}
                  that shows exactly what to fix first.
                </p>
                {/* <p className="text-xs" style={{ color: "#8b949e" }}>
                  Based on Daniel Jackson&apos;s usability principles + the UNIX philosophy
                </p> */}
              </div>

              {/* Dimension chips */}
              <div className="flex flex-wrap gap-2">
                {DIMENSIONS.map((d) => (
                  <span
                    key={d.label}
                    className="text-xs font-mono px-3 py-1.5 rounded"
                    style={{ background: "#101010", border: "1px solid #3d3a39", color: "#8b949e" }}
                  >
                    {d.icon} {d.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div
              className="rounded-lg p-6"
              style={{
                background: "#101010",
                border: "1px solid #3d3a39",
                boxShadow: "rgba(92, 88, 85, 0.2) 0px 0px 15px",
              }}
            >
              <CLIInputForm
                onResult={handleResult}
                onError={setError}
                loading={loading}
                setLoading={setLoading}
              />
              {error && (
                <p
                  className="mt-4 text-sm px-4 py-3 rounded font-mono"
                  style={{
                    color: "#fb565b",
                    background: "rgba(251, 86, 91, 0.08)",
                    border: "1px solid rgba(251, 86, 91, 0.3)",
                  }}
                >
                  {error}
                </p>
              )}
            </div>
          </div>
        </main>
      ) : (
        /* ── Results ─────────────────────────────────────────────────── */
        <main className="max-w-screen-xl mx-auto px-8 py-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handleReset}
              className="text-sm font-mono transition-colors"
              style={{ color: "#8b949e" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f2f2")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
            >
              ← evaluate another
            </button>
            <button
              onClick={handleCopyLink}
              className="text-sm font-semibold transition-colors font-mono"
              style={{ color: copied ? "#00d992" : "#2fd6a1" }}
            >
              {copied ? "✓ copied" : "share results ↗"}
            </button>
          </div>

          {/* Two-column results layout */}
          <div className="flex gap-8 items-start">
            {/* Left — sticky score + chart */}
            <div className="w-80 shrink-0 sticky top-20 space-y-0">
              <div
                className="rounded-lg p-6 space-y-6"
                style={{
                  background: "#101010",
                  border: "1px solid #3d3a39",
                  boxShadow: "rgba(92, 88, 85, 0.2) 0px 0px 15px",
                }}
              >
                <ScoreCard
                  score={result.cluxScore}
                  cliName={result.cliName}
                  summary={result.overallSummary}
                  audience={result.audience}
                />
                <div style={{ borderTop: "1px solid #3d3a39" }} className="pt-4">
                  <CLUXRadarChart dimensions={result.dimensions} />
                </div>
              </div>

              {/* Signup nudge */}
              <div
                className="rounded-lg p-5 space-y-3 mt-4"
                style={{
                  background: "#101010",
                  border: "2px solid #00d992",
                  boxShadow: "rgba(0, 217, 146, 0.06) 0px 0px 20px",
                }}
              >
                <p className="font-semibold text-sm" style={{ color: "#f2f2f2" }}>
                  Track your CLI&apos;s score over time
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>
                  Get notified when org guideline comparison launches.
                </p>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full text-xs px-3 py-2 rounded font-mono focus:outline-none"
                    style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
                  />
                  <button
                    type="submit"
                    className="w-full text-xs font-semibold py-2 rounded font-mono transition-opacity hover:opacity-80"
                    style={{ background: "#050507", color: "#2fd6a1", border: "1px solid #3d3a39" }}
                  >
                    Notify me
                  </button>
                </form>
              </div>
            </div>

            {/* Right — scrollable dimension breakdown */}
            <div className="flex-1 min-w-0">
              <DimensionFeedback dimensions={result.dimensions} />
            </div>
          </div>
        </main>
      )}

      <footer style={{ borderTop: "1px solid #3d3a39" }} className="mt-16">
        <div className="max-w-screen-xl mx-auto px-8 py-6 flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: "#8b949e" }}>
            CLUX · Built with Claude
          </span>
          <a
            href="https://github.com/amylily1011/clux"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono transition-colors"
            style={{ color: "#8b949e" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00d992")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
          >
            Open source ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
