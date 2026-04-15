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

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_STYLES: Record<Severity, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: "#fb565b", bg: "rgba(251,86,91,0.10)",   border: "rgba(251,86,91,0.30)",   label: "CRITICAL" },
  high:     { color: "#ff8c42", bg: "rgba(255,140,66,0.10)",  border: "rgba(255,140,66,0.30)",  label: "HIGH" },
  medium:   { color: "#ffba00", bg: "rgba(255,186,0,0.10)",   border: "rgba(255,186,0,0.30)",   label: "MED" },
  low:      { color: "#8b949e", bg: "rgba(139,148,158,0.10)", border: "rgba(139,148,158,0.25)", label: "LOW" },
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
        className="text-base font-black tabular-nums font-mono w-7 shrink-0"
        style={{ color, filter: `drop-shadow(0 0 4px ${color}50)` }}
      >
        {score}
      </span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

function DimensionCard({ d }: { d: DimensionScore }) {
  const [showAll, setShowAll] = useState(false);
  const highConfidence = d.findings.filter((f) => f.confidence >= CONFIDENCE_THRESHOLD);
  const lowConfidence  = d.findings.filter((f) => f.confidence < CONFIDENCE_THRESHOLD);
  const visible = showAll ? d.findings : highConfidence;

  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-lg"
      style={{ background: "#101010", border: "1px solid #3d3a39" }}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">{DIMENSION_ICONS[d.dimension] ?? "•"}</span>
          <span className="text-sm font-semibold" style={{ color: "#f2f2f2" }}>{d.dimension}</span>
        </div>
        <ScoreBar score={d.score} />
        <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>{d.summary}</p>
      </div>

      {/* Findings */}
      {visible.length > 0 && (
        <div className="space-y-2" style={{ borderTop: "1px solid #1a1a1a", paddingTop: "0.75rem" }}>
          <p className="text-xs font-mono uppercase" style={{ color: "#3d3a39", letterSpacing: "1.5px" }}>
            Findings
          </p>
          <ul className="space-y-2">
            {visible.map((f, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums"
                  style={{
                    color:      f.confidence >= 90 ? "#00d992" : "#ffba00",
                    background: f.confidence >= 90 ? "rgba(0,217,146,0.08)" : "rgba(255,186,0,0.08)",
                    border:     f.confidence >= 90 ? "1px solid rgba(0,217,146,0.2)" : "1px solid rgba(255,186,0,0.2)",
                  }}
                >
                  {f.confidence}%
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "#b8b3b0" }}>{f.text}</span>
              </li>
            ))}
          </ul>
          {lowConfidence.length > 0 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs font-mono transition-colors"
              style={{ color: "#3d3a39" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#8b949e")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
            >
              {showAll ? "↑ hide low-confidence" : `+ ${lowConfidence.length} low-confidence`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface Fix {
  text: string;
  severity: Severity;
  dimension: string;
}

function RecommendedFixes({ dimensions }: { dimensions: DimensionScore[] }) {
  // Flatten all recommendations, tag with dimension
  const all: Fix[] = dimensions.flatMap((d) =>
    d.recommendations.map((r) => ({
      text: r.text,
      severity: r.severity,
      dimension: d.dimension,
    }))
  );

  // Group by severity in priority order
  const grouped = SEVERITY_ORDER.reduce<Record<Severity, Fix[]>>(
    (acc, s) => {
      acc[s] = all.filter((f) => f.severity === s);
      return acc;
    },
    { critical: [], high: [], medium: [], low: [] }
  );

  const hasAny = all.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#8b949e", letterSpacing: "2px" }}>
          Recommended Fixes
        </p>
        <span className="text-xs font-mono" style={{ color: "#3d3a39" }}>
          ranked by priority
        </span>
      </div>

      {!hasAny ? (
        <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>No recommendations.</p>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid #3d3a39" }}
        >
          {SEVERITY_ORDER.map((severity, si) => {
            const fixes = grouped[severity];
            if (fixes.length === 0) return null;
            const s = SEVERITY_STYLES[severity];
            return (
              <div
                key={severity}
                style={{ borderTop: si === 0 ? "none" : "1px solid #1a1a1a" }}
              >
                {/* Severity header */}
                <div
                  className="flex items-center gap-3 px-5 py-2"
                  style={{ background: "#0d0d0d" }}
                >
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                    style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    {s.label}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "#3d3a39" }}>
                    {fixes.length} fix{fixes.length > 1 ? "es" : ""}
                  </span>
                </div>

                {/* Fixes */}
                <ul>
                  {fixes.map((fix, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 px-5 py-3"
                      style={{
                        borderTop: "1px solid #1a1a1a",
                        background: "#101010",
                      }}
                    >
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-0.5"
                        style={{
                          color: "#8b949e",
                          background: "#0d0d0d",
                          border: "1px solid #1a1a1a",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {DIMENSION_ICONS[fix.dimension]} {fix.dimension}
                      </span>
                      <span className="text-sm leading-relaxed" style={{ color: "#b8b3b0" }}>
                        {fix.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DimensionFeedback({ dimensions }: Props) {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-8">
      {/* Dimension cards — findings only */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#8b949e", letterSpacing: "2px" }}>
          Dimension Breakdown
        </p>
        <div className="grid grid-cols-2 gap-2">
          {sorted.map((d) => <DimensionCard key={d.dimension} d={d} />)}
        </div>
      </div>

      {/* Recommendations — unified, ranked */}
      <RecommendedFixes dimensions={dimensions} />

      {/* Screen reader */}
      <table className="sr-only">
        <caption>CLUX dimension scores</caption>
        <thead><tr><th>Dimension</th><th>Score</th><th>Summary</th></tr></thead>
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
    </div>
  );
}
