export interface DimensionScore {
  dimension: string;
  score: number; // 0–100
  summary: string;
  findings: string[];
  recommendations: string[];
}

export interface EvaluationResult {
  cluxScore: number; // 0–100 weighted average
  cliName: string;
  overallSummary: string;
  dimensions: DimensionScore[];
  audience: CLIAudience;
}

export type CLIAudience = "human" | "scripting";

export interface EvaluationRequest {
  cliText: string;
  cliName?: string;
  inputType: "help" | "manpage" | "errors" | "general";
  audience: CLIAudience;
}
