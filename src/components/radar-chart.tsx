"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import type { DimensionScore } from "@/types/evaluation";

interface Props {
  dimensions: DimensionScore[];
}

const SHORT_LABELS: Record<string, string> = {
  Learnability: "Learn",
  "Error Tolerance": "Errors",
  Efficiency: "Efficiency",
  Safety: "Safety",
  "UNIX Compliance": "UNIX",
  Pleasantness: "UX Feel",
  Security: "Security",
  Accessibility: "A11y",
};

export function CLUXRadarChart({ dimensions }: Props) {
  const data = dimensions.map((d) => ({
    dimension: SHORT_LABELS[d.dimension] ?? d.dimension,
    score: d.score,
    fullMark: 100,
  }));

  return (
    <div className="w-full">
      {/* Screen-reader accessible table */}
      <table className="sr-only">
        <caption>CLUX dimension scores</caption>
        <thead>
          <tr>
            <th>Dimension</th>
            <th>Score (out of 100)</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map((d) => (
            <tr key={d.dimension}>
              <td>{d.dimension}</td>
              <td>{d.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ResponsiveContainer width="100%" height={340} aria-hidden="true">
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
          />
          <Radar
            name="CLUX"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
