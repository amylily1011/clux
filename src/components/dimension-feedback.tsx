"use client";

import { useState } from "react";
import type { DimensionScore, Recommendation, Severity } from "@/types/evaluation";

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

const DIMENSION_DESCRIPTIONS: Record<string, string> = {
  Learnability:
    "Does the CLI teach itself to new users? Evaluates naming consistency, help text quality, command hierarchy, and discoverability.",
  "Error Tolerance":
    "Does the CLI recover gracefully when things go wrong? Evaluates error message clarity, typo correction, and validation before destructive operations.",
  Efficiency:
    "Can experienced users work fast? Evaluates alias support, machine-readable output, tab completion, and shorthand flags.",
  Safety:
    "Does the CLI protect users from irreversible mistakes? Evaluates confirmation prompts, dry-run support, and warnings before data loss.",
  "UNIX Compliance":
    "Does it play well with the UNIX ecosystem? Evaluates stdin/stdout/stderr usage, meaningful exit codes, and composability with pipes.",
  Pleasantness:
    "Is it enjoyable to use? Evaluates naming consistency, sensible defaults, output readability, and overall polish.",
  Security:
    "Does it handle sensitive data responsibly? Evaluates how credentials are passed, masked in output, and least-privilege principles.",
  Accessibility:
    "Can users with different needs use it effectively? Evaluates no-color support, text/icon pairing with color signals, and screen-reader compatibility.",
};

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];
const PRIORITY_SEVERITIES: Severity[] = ["critical", "high"];
const LOWER_SEVERITIES: Severity[] = ["medium", "low"];

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
  const [showTooltip, setShowTooltip] = useState(false);
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
          <div className="relative">
            <span
              className="text-sm font-semibold cursor-help"
              style={{ color: "#f2f2f2" }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {d.dimension}
            </span>
            {showTooltip && DIMENSION_DESCRIPTIONS[d.dimension] && (
              <div
                className="absolute left-0 z-20 p-3 rounded-lg text-xs leading-relaxed w-60"
                style={{
                  bottom: "calc(100% + 6px)",
                  background: "#1a1a1a",
                  border: "1px solid #3d3a39",
                  color: "#b8b3b0",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                  pointerEvents: "none",
                }}
              >
                {DIMENSION_DESCRIPTIONS[d.dimension]}
              </div>
            )}
          </div>
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

function TerminalBlock({ code, accent }: { code: string; accent?: string }) {
  return (
    <pre
      className="text-xs font-mono leading-relaxed overflow-x-auto rounded-md px-3 py-2.5 whitespace-pre"
      style={{
        background: "#0a0a0a",
        border: `1px solid ${accent ? accent + "30" : "#1a1a1a"}`,
        color: accent ?? "#b8b3b0",
      }}
    >
      {code}
    </pre>
  );
}

interface BehaviorEntry {
  dimension: string;
  severity: Severity;
  text: string;
  snippet?: string;
}

interface BehaviorPair {
  dimension: string;
  severity: Severity;
  finding: BehaviorEntry | null;
  rec: BehaviorEntry;
}

function BehaviorRow({ entry, accent }: { entry: BehaviorEntry; accent: string }) {
  const s = SEVERITY_STYLES[entry.severity];
  return (
    <div
      className="flex gap-3 py-3 items-start"
      style={{ borderTop: "1px solid #1a1a1a" }}
    >
      <span
        className="text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums"
        style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
      >
        {s.label}
      </span>
      <div className="flex-1 space-y-1.5 min-w-0">
        <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>
          {DIMENSION_ICONS[entry.dimension] ?? "•"} {entry.dimension}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#b8b3b0" }}>{entry.text}</p>
        {entry.snippet && <TerminalBlock code={entry.snippet} accent={accent} />}
      </div>
    </div>
  );
}

function BehaviorSummary({ dimensions }: { dimensions: DimensionScore[] }) {
  // Build one pair per dimension: top priority recommendation + top finding, sharing the same severity.
  const pairs: BehaviorPair[] = dimensions
    .flatMap((d) => {
      const topRec = [...d.recommendations]
        .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
        .find((r) => PRIORITY_SEVERITIES.includes(r.severity));
      if (!topRec) return [];

      const topFinding = d.findings.find((f) => f.confidence >= CONFIDENCE_THRESHOLD);
      return [{
        dimension: d.dimension,
        severity: topRec.severity,
        finding: topFinding
          ? { dimension: d.dimension, severity: topRec.severity, text: topFinding.text, snippet: topFinding.example }
          : null,
        rec: { dimension: d.dimension, severity: topRec.severity, text: topRec.text, snippet: topRec.after },
      }];
    })
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity))
    .slice(0, 5);

  if (pairs.length === 0) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#8b949e", letterSpacing: "2px" }}>
        Current Behavior & Proposed Changes
      </p>
      <div className="space-y-3">

        {/* Current Behavior */}
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #3d3a39" }}>
          <div className="px-4 py-2.5" style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
            <p className="text-xs font-mono font-bold" style={{ color: "#ffba00" }}>Current Behavior</p>
          </div>
          <div className="px-4" style={{ background: "#101010" }}>
            {pairs.map((p, i) =>
              p.finding
                ? <BehaviorRow key={i} entry={p.finding} accent="#ffba00" />
                : null
            )}
          </div>
        </div>

        {/* Proposed Changes */}
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid #3d3a39" }}>
          <div className="px-4 py-2.5" style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
            <p className="text-xs font-mono font-bold" style={{ color: "#00d992" }}>Recommended Fixes</p>
          </div>
          <div className="px-4" style={{ background: "#101010" }}>
            {pairs.map((p, i) => (
              <BehaviorRow key={i} entry={p.rec} accent="#00d992" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export function DimensionFeedback({ dimensions }: Props) {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-8">
      <BehaviorSummary dimensions={dimensions} />

      {/* Dimension cards */}
      <div className="space-y-3">
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#8b949e", letterSpacing: "2px" }}>
          Dimension Breakdown
        </p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {sorted.map((d) => <DimensionCard key={d.dimension} d={d} />)}
        </div>
      </div>

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
