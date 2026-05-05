import { z } from "zod";

export const RULE_SEVERITIES = ["error", "warning"] as const;
export const RULE_CATEGORIES = ["naming", "output", "error-handling", "safety", "security", "terminology", "other"] as const;

export const ConventionRuleSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(10).max(200),
  severity: z.enum(RULE_SEVERITIES),
  category: z.enum(RULE_CATEGORIES),
});

export const FindingSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(100),
  example: z.string().optional(),
});

export const RecommendationSchema = z.object({
  text: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  after: z.string().optional(),
});

export const DimensionScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  findings: z.array(FindingSchema).min(1),
  recommendations: z.array(RecommendationSchema),
});

export const ComplianceItemSchema = z.object({
  rule: z.string(),
  passed: z.boolean(),
  note: z.string().optional(),
});

// Validates Claude's convention-mode response — complianceItems required, not optional
export const ConventionResponseSchema = z.object({
  cluxScore: z.number().min(0).max(100),
  cliName: z.string(),
  overallSummary: z.string(),
  dimensions: z.array(DimensionScoreSchema).length(8),
  complianceItems: z.array(ComplianceItemSchema).min(1),
});

// Validates Claude's raw response (no audience — stamped on by the API route)
export const ClaudeResponseSchema = z.object({
  cluxScore: z.number().min(0).max(100),
  cliName: z.string(),
  overallSummary: z.string(),
  dimensions: z.array(DimensionScoreSchema).length(8),
  complianceItems: z.array(ComplianceItemSchema).optional(),
});

// Full result including audience, used client-side
export const EvaluationResultSchema = ClaudeResponseSchema.extend({
  audience: z.enum(["human", "scripting"]),
});

export const EvaluationRequestSchema = z.discriminatedUnion("inputMode", [
  z.object({
    inputMode: z.literal("paste"),
    cliText: z.string().min(10).max(12000),
    audience: z.enum(["human", "scripting"]),
  }),
  z.object({
    inputMode: z.literal("convention"),
    conventionRules: z.string().min(10).max(12000),
    cliText: z.string().min(10).max(12000),
    audience: z.enum(["human", "scripting"]),
  }),
]);
