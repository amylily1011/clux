import { z } from "zod";

export const DimensionScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  findings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const EvaluationResultSchema = z.object({
  cluxScore: z.number().min(0).max(100),
  cliName: z.string(),
  overallSummary: z.string(),
  dimensions: z.array(DimensionScoreSchema).length(8),
  audience: z.enum(["human", "scripting"]),
});

export const EvaluationRequestSchema = z.object({
  cliText: z.string().min(10).max(12000),
  cliName: z.string().max(100).optional(),
  inputType: z.enum(["help", "manpage", "errors", "general"]),
  audience: z.enum(["human", "scripting"]),
});
