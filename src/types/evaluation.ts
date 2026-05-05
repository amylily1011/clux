export type CLIAudience = "human" | "scripting";

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  text: string;
  confidence: number; // 0–100
  example?: string;   // CLI snippet showing the problematic behavior
}

export interface Recommendation {
  text: string;
  severity: Severity;
  after?: string;     // CLI snippet showing the improved behavior
}

export interface DimensionScore {
  dimension: string;
  score: number; // 0–100
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
}

export interface ComplianceItem {
  rule: string;
  passed: boolean;
  note?: string;
}

export interface EvaluationResult {
  cluxScore: number; // 0–100 weighted average
  cliName: string;
  overallSummary: string;
  dimensions: DimensionScore[];
  audience: CLIAudience;
  complianceItems?: ComplianceItem[];
}

export type InputMode = "name" | "paste" | "convention";

export interface EvaluationRequest {
  inputMode: InputMode;
  cliName?: string;   // name mode
  docsUrl?: string;   // optional reference URL (name mode only)
  cliText?: string;   // paste mode
  audience: CLIAudience;
}
