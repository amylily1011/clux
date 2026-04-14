"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CLIInputForm } from "@/components/cli-input-form";
import { ScoreCard } from "@/components/score-card";
import { DimensionFeedback } from "@/components/dimension-feedback";
import { EvaluationResultSchema } from "@/lib/schema";
import { encodeResult, decodeResult } from "@/lib/share";
import type { EvaluationResult } from "@/types/evaluation";

// Recharts must render client-side only
const CLUXRadarChart = dynamic(
  () => import("@/components/radar-chart").then((m) => m.CLUXRadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] animate-pulse bg-slate-100 rounded-xl" />
    ),
  }
);

export default function Home() {
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Load shared result from URL hash on mount
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-indigo-600 tracking-tight">
              CLUX
            </span>
            <span className="ml-2 text-sm text-slate-500">CLI UX Evaluator</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        {!result ? (
          <>
            {/* Hero */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Is your CLI actually usable?
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed">
                Paste your CLI&apos;s help text or man page. Get an AI-powered UX
                evaluation across 8 heuristic dimensions — and a{" "}
                <span className="font-semibold text-indigo-600">CLUX Score</span>{" "}
                that shows what to fix first.
              </p>
              <p className="text-xs text-slate-400">
                Based on Daniel Jackson&apos;s usability principles + the UNIX
                philosophy
              </p>
            </div>

            {/* Input form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <CLIInputForm
                onResult={handleResult}
                onError={setError}
                loading={loading}
                setLoading={setLoading}
              />
              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  {error}
                </p>
              )}
            </div>

            {/* Dimension preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { icon: "📖", label: "Learnability" },
                { icon: "⚠️", label: "Error Tolerance" },
                { icon: "⚡", label: "Efficiency" },
                { icon: "🛡️", label: "Safety" },
                { icon: "🐚", label: "UNIX Compliance" },
                { icon: "✨", label: "Pleasantness" },
                { icon: "🔒", label: "Security" },
                { icon: "♿", label: "Accessibility" },
              ].map((d) => (
                <div
                  key={d.label}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-sm text-slate-600"
                >
                  <div className="text-xl mb-1">{d.icon}</div>
                  {d.label}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Evaluate another CLI
              </button>
              <button
                onClick={handleCopyLink}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {copied ? "✓ Copied!" : "Share results ↗"}
              </button>
            </div>

            {/* Score + chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
              <ScoreCard
                score={result.cluxScore}
                cliName={result.cliName}
                summary={result.overallSummary}
                audience={result.audience}
              />
              <CLUXRadarChart dimensions={result.dimensions} />
            </div>

            {/* Dimension breakdown */}
            <DimensionFeedback dimensions={result.dimensions} />

            {/* Signup nudge */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center space-y-3">
              <p className="font-semibold text-indigo-900">
                Want to track your CLI&apos;s score over time?
              </p>
              <p className="text-sm text-indigo-700">
                Get notified when org guideline comparison launches — evaluate
                your CLI against your own style guide.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 text-sm border border-indigo-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Notify me
                </button>
              </form>
            </div>

            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                ← Evaluate another CLI
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          CLUX · Built with Claude · Open source on GitHub
        </div>
      </footer>
    </div>
  );
}
