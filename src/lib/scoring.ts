import type { CLIAudience, DimensionScore } from "@/types/evaluation";

// Human-first: prioritises discoverability, friendliness, safety prompts, polish
const HUMAN_WEIGHTS: Record<string, number> = {
  Learnability: 0.22,
  "Error Tolerance": 0.18,
  Pleasantness: 0.14,
  Safety: 0.13,
  Security: 0.10,
  Efficiency: 0.10,
  "UNIX Compliance": 0.08,
  Accessibility: 0.05,
};

// Scripting-first: prioritises machine-readability, predictability, composability
const SCRIPTING_WEIGHTS: Record<string, number> = {
  "UNIX Compliance": 0.26,
  Efficiency: 0.20,
  "Error Tolerance": 0.16,
  Security: 0.14,
  Safety: 0.12,
  Learnability: 0.07,
  Pleasantness: 0.03,
  Accessibility: 0.02,
};

export function getWeights(audience: CLIAudience): Record<string, number> {
  return audience === "scripting" ? SCRIPTING_WEIGHTS : HUMAN_WEIGHTS;
}

export function computeCluxScore(
  dimensions: DimensionScore[],
  audience: CLIAudience
): number {
  const weights = getWeights(audience);
  const total = dimensions.reduce((sum, d) => {
    const weight = weights[d.dimension] ?? 0.1;
    return sum + d.score * weight;
  }, 0);
  return Math.round(total);
}

export function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-600";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

export function scoreBg(score: number): string {
  if (score >= 75) return "bg-emerald-50 border-emerald-200";
  if (score >= 50) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Poor";
  return "Critical";
}
