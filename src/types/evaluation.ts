export type CLIAudience = "human" | "scripting";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  text: string;
  confidence: number; // 0–100
}

export interface Recommendation {
  text: string;
  severity: Severity;
}

export interface DimensionScore {
  dimension: string;
  score: number; // 0–100
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
}

export interface EvaluationResult {
  cluxScore: number; // 0–100 weighted average
  cliName: string;
  overallSummary: string;
  dimensions: DimensionScore[];
  audience: CLIAudience;
}

export interface EvaluationRequest {
  cliText: string;
  audience: CLIAudience;
}
