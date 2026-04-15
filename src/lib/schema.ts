import { z } from "zod";

export const FindingSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(100),
});

export const RecommendationSchema = z.object({
  text: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
});

export const DimensionScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  findings: z.array(FindingSchema),
  recommendations: z.array(RecommendationSchema),
});

// Validates Claude's raw response (no audience — stamped on by the API route)
export const ClaudeResponseSchema = z.object({
  cluxScore: z.number().min(0).max(100),
  cliName: z.string(),
  overallSummary: z.string(),
  dimensions: z.array(DimensionScoreSchema).length(8),
});

// Full result including audience, used client-side
export const EvaluationResultSchema = ClaudeResponseSchema.extend({
  audience: z.enum(["human", "scripting"]),
});

export const EvaluationRequestSchema = z.discriminatedUnion("inputMode", [
  z.object({
    inputMode: z.literal("name"),
    cliName: z.string().min(1).max(100),
    docsUrl: z.string().url().optional(),
    audience: z.enum(["human", "scripting"]),
  }),
  z.object({
    inputMode: z.literal("paste"),
    cliText: z.string().min(10).max(12000),
    audience: z.enum(["human", "scripting"]),
  }),
]);
