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
  Learnability: "Learnability",
  "Error Tolerance": "Error Tolerance",
  Efficiency: "Efficiency",
  Safety: "Safety",
  "UNIX Compliance": "UNIX Compliance",
  Pleasantness: "Pleasantness",
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
      <ResponsiveContainer width="100%" height={320} aria-hidden="true">
        <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
          <PolarGrid stroke="#3d3a39" strokeOpacity={0.8} />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{
              fontSize: 11,
              fill: "#8b949e",
              fontFamily: "var(--font-geist-mono), monospace",
              fontWeight: 500,
            }}
          />
          <Radar
            name="CLUX"
            dataKey="score"
            stroke="#00d992"
            fill="#00d992"
            fillOpacity={0.12}
            strokeWidth={1.5}
            dot={{ fill: "#00d992", r: 3, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
