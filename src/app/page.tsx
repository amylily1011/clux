"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CLIInputForm } from "@/components/cli-input-form";
import { ScoreCard } from "@/components/score-card";
import { DimensionFeedback } from "@/components/dimension-feedback";
import { ConventionChecklist } from "@/components/convention-checklist";
import { HistorySidebar } from "@/components/history-sidebar";
import type { InputMode } from "@/types/evaluation";
import { EvaluationResultSchema } from "@/lib/schema";
import { encodeResult, decodeResult } from "@/lib/share";
import type { EvaluationResult } from "@/types/evaluation";
import { saveToHistory } from "@/lib/history";
import type { HistoryItem } from "@/lib/history";

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

function shortId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default function Home() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareLabel, setShareLabel] = useState<"share ↗" | "copying..." | "✓ copied">("share ↗");
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    if (hash.startsWith("s/")) {
      const id = hash.slice(2);
      fetch(`/api/share/${id}`)
        .then((r) => r.json())
        .then((data) => {
          const parsed = EvaluationResultSchema.safeParse(data);
          if (parsed.success) setResult(parsed.data);
        })
        .catch(() => {});
      return;
    }

    const decoded = decodeResult(hash);
    if (decoded) setResult(decoded);
  }, []);

  function handleResult(data: unknown, mode?: InputMode) {
    const parsed = EvaluationResultSchema.safeParse(data);
    if (!parsed.success) {
      setError("Received an unexpected response format. Please try again.");
      return;
    }
    const ev = parsed.data;
    setResult(ev);

    const item: HistoryItem = {
      id: shortId(),
      cliName: ev.cliName,
      score: ev.cluxScore,
      inputMode: mode ?? inputMode,
      createdAt: Date.now(),
      result: ev,
    };
    saveToHistory(item);

    const encoded = encodeResult(ev);
    window.history.replaceState(null, "", `#${encoded}`);

    fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ev),
    })
      .then((r) => r.json())
      .then(({ id }) => {
        if (id) window.history.replaceState(null, "", `#s/${id}`);
      })
      .catch(() => {});
  }

  function handleRestore(item: HistoryItem) {
    setResult(item.result);
    setInputMode(item.inputMode);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function handleReset() {
    setResult(null);
    setError("");
    window.history.replaceState(null, "", window.location.pathname);
  }

  async function handleCopyLink() {
    setShareLabel("copying...");
    await navigator.clipboard.writeText(window.location.href);
    setShareLabel("✓ copied");
    setTimeout(() => setShareLabel("share ↗"), 2000);
  }

  function handleModeChange(mode: InputMode) {
    setInputMode(mode);
  }

  return (
    <div className="min-h-screen" style={{ background: "#050507" }}>
      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestore={handleRestore}
      />


      {/* Header */}
      <header
        style={{ borderBottom: "1px solid #3d3a39", background: "#050507" }}
        className="sticky top-0 z-30"
      >
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={handleReset}
              className="text-2xl font-black tracking-tighter glow-emerald transition-opacity"
              style={{ color: "#00d992", fontFamily: "system-ui", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              CLUX
            </Link>
            <span
              className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded"
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
        <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-10 md:py-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16 md:items-start">
            {/* Left — hero copy */}
            <div className="space-y-6 md:space-y-8 text-center md:text-left md:pt-4">
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
                    fontSize: "clamp(2rem, 6vw, 3.75rem)",
                  }}
                >
                  Is your CLI actually{" "}
                  <span style={{ color: "#00d992" }}>usable?</span>
                </h1>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: "#b8b3b0" }}>
                  AI-powered evaluation across 8 heuristic dimensions — get a{" "}
                  <span style={{ color: "#2fd6a1" }} className="font-semibold">
                    CLUX Score
                  </span>{" "}
                  and know exactly what to fix first.
                </p>
              </div>

              <div className="hidden md:flex flex-wrap gap-2">
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

            {/* Right — form with history above */}
            <div className="max-w-lg mx-auto w-full md:max-w-none">
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="text-xs font-mono transition-colors"
                  style={{ color: "#8b949e" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
                >
                  history ↑
                </button>
              </div>
              <div
                className="rounded-lg p-4 md:p-6"
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
                  onModeChange={handleModeChange}
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
          </div>
        </main>
      ) : (
        /* ── Results ─────────────────────────────────────────────────── */
        <main className="max-w-screen-xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <button
              onClick={handleReset}
              className="text-sm font-mono transition-colors"
              style={{ color: "#8b949e" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f2f2")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
            >
              ← evaluate another
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setHistoryOpen(true)}
                className="text-sm font-mono transition-colors"
                style={{ color: "#8b949e" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f2f2")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8b949e")}
              >
                history
              </button>
              <button
                onClick={handleCopyLink}
                className="text-sm font-semibold transition-colors font-mono"
                style={{ color: shareLabel === "✓ copied" ? "#00d992" : "#2fd6a1" }}
              >
                {shareLabel}
              </button>
            </div>
          </div>

          {/* Results layout */}
          <div className="flex flex-col gap-6 md:flex-row md:gap-8 md:items-start">
            {/* Score + chart panel */}
            <div className="w-full md:w-80 md:shrink-0 md:sticky md:top-20 space-y-4">
              <div
                className="rounded-lg p-4 md:p-6 space-y-6"
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

            </div>

            {/* Dimension breakdown */}
            <div className="flex-1 min-w-0">
              {inputMode === "convention" && result.complianceItems != null && result.complianceItems.length > 0 && (
                <ConventionChecklist items={result.complianceItems} />
              )}
              <DimensionFeedback dimensions={result.dimensions} />
            </div>
          </div>
        </main>
      )}

      <footer style={{ borderTop: "1px solid #3d3a39" }} className="mt-16">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: "#8b949e" }}>
            CLUX
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
