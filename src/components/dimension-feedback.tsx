"use client";

import { useState } from "react";
import type { DimensionScore, Severity } from "@/types/evaluation";

interface Props {
  dimensions: DimensionScore[];
}

const DIMENSION_ICONS: Record<string, string> = {
  Learnability: "📖",
  "Error Tolerance": "⚠️",
  Efficiency: "⚡",
  Safety: "🛡️",
  "UNIX Compliance": "🐚",
  Pleasantness: "✨",
  Security: "🔒",
  Accessibility: "♿",
};

const SEVERITY_STYLES: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#fb565b", bg: "rgba(251,86,91,0.10)", border: "rgba(251,86,91,0.35)", label: "CRITICAL" },
  high:     { color: "#ff8c42", bg: "rgba(255,140,66,0.10)", border: "rgba(255,140,66,0.35)", label: "HIGH" },
  medium:   { color: "#ffba00", bg: "rgba(255,186,0,0.10)",  border: "rgba(255,186,0,0.35)",  label: "MED" },
  low:      { color: "#8b949e", bg: "rgba(139,148,158,0.10)", border: "rgba(139,148,158,0.30)", label: "LOW" },
};

const CONFIDENCE_THRESHOLD = 75;

function scoreColor(score: number): string {
  if (score >= 75) return "#00d992";
  if (score >= 50) return "#ffba00";
  return "#fb565b";
}

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-lg font-black tabular-nums font-mono w-8 shrink-0"
        style={{ color, filter: `drop-shadow(0 0 4px ${color}50)` }}
      >
        {score}
      </span>
      <div
        className="flex-1 h-1 rounded-full overflow-hidden"
        style={{ background: "#1a1a1a" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

function DimensionRow({ d }: { d: DimensionScore }) {
  const [showAll, setShowAll] = useState(false);

  const highConfidence = d.findings.filter((f) => f.confidence >= CONFIDENCE_THRESHOLD);
  const lowConfidence  = d.findings.filter((f) => f.confidence < CONFIDENCE_THRESHOLD);
  const visibleFindings = showAll ? d.findings : highConfidence;

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-lg"
      style={{ background: "#101010", border: "1px solid #3d3a39" }}
    >
      {/* Dimension + score */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">
            {DIMENSION_ICONS[d.dimension] ?? "•"}
          </span>
          <span className="text-sm font-semibold" style={{ color: "#f2f2f2" }}>
            {d.dimension}
          </span>
        </div>
        <ScoreBar score={d.score} />
        <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>
          {d.summary}
        </p>
      </div>

      {/* Findings */}
      <div className="space-y-2">
        <p
          className="text-xs font-mono uppercase"
          style={{ color: "#3d3a39", letterSpacing: "1.5px" }}
        >
          Findings
        </p>
        {visibleFindings.length === 0 ? (
          <p className="text-xs" style={{ color: "#3d3a39" }}>No high-confidence findings</p>
        ) : (
          <ul className="space-y-2">
            {visibleFindings.map((f, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums"
                  style={{
                    color: f.confidence >= 90 ? "#00d992" : f.confidence >= 75 ? "#ffba00" : "#8b949e",
                    background: f.confidence >= 90 ? "rgba(0,217,146,0.08)" : f.confidence >= 75 ? "rgba(255,186,0,0.08)" : "rgba(139,148,158,0.08)",
                    border: f.confidence >= 90 ? "1px solid rgba(0,217,146,0.2)" : f.confidence >= 75 ? "1px solid rgba(255,186,0,0.2)" : "1px solid rgba(139,148,158,0.2)",
                  }}
                >
                  {f.confidence}%
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "#b8b3b0" }}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        )}
        {lowConfidence.length > 0 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-xs font-mono transition-colors mt-1"
            style={{ color: "#3d3a39" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b949e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
          >
            {showAll
              ? "↑ hide low-confidence"
              : `+ ${lowConfidence.length} low-confidence finding${lowConfidence.length > 1 ? "s" : ""}`}
          </button>
        )}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <p
          className="text-xs font-mono uppercase"
          style={{ color: "#3d3a39", letterSpacing: "1.5px" }}
        >
          Recommendations
        </p>
        {d.recommendations.length === 0 ? (
          <p className="text-xs" style={{ color: "#3d3a39" }}>No recommendations</p>
        ) : (
          <ul className="space-y-2">
            {d.recommendations.map((r, i) => {
              const s = SEVERITY_STYLES[r.severity];
              return (
                <li key={i} className="flex gap-2 items-start">
                  <span
                    className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5 font-bold"
                    style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    {s.label}
                  </span>
                  <span className="text-xs leading-relaxed" style={{ color: "#b8b3b0" }}>
                    {r.text}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function DimensionFeedback({ dimensions }: Props) {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-3">
      <p
        className="text-xs font-mono uppercase tracking-widest"
        style={{ color: "#8b949e", letterSpacing: "2px" }}
      >
        Dimension Breakdown
      </p>

      {/* Screen-reader table */}
      <table className="sr-only">
        <caption>CLUX dimension scores</caption>
        <thead>
          <tr><th>Dimension</th><th>Score</th><th>Summary</th></tr>
        </thead>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.dimension}>
              <td>{d.dimension}</td>
              <td>{d.score} out of 100</td>
              <td>{d.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-2">
        {sorted.map((d) => (
          <DimensionRow key={d.dimension} d={d} />
        ))}
      </div>
    </div>
  );
}
