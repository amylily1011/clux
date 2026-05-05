import { describe, it, expect } from "vitest";
import { ConventionRuleSchema, ConventionResponseSchema, ClaudeResponseSchema } from "../schema";

const validRule = {
  id: "rule-001",
  text: "All flags must use --kebab-case format",
  severity: "error",
  category: "naming",
};

const baseDimension = {
  dimension: "Learnability",
  score: 80,
  summary: "Good learnability.",
  findings: [],
  recommendations: [],
};

const allDimensions = [
  "Learnability", "Error Tolerance", "Efficiency", "Safety",
  "UNIX Compliance", "Pleasantness", "Security", "Accessibility",
].map((d) => ({ ...baseDimension, dimension: d }));

const baseResponse = {
  cluxScore: 75,
  cliName: "mycli",
  overallSummary: "Solid CLI.",
  dimensions: allDimensions,
};

describe("ConventionRuleSchema", () => {
  it("accepts a valid rule", () => {
    expect(() => ConventionRuleSchema.parse(validRule)).not.toThrow();
  });

  it("accepts terminology category", () => {
    expect(() => ConventionRuleSchema.parse({ ...validRule, category: "terminology" })).not.toThrow();
  });

  it("rejects text shorter than 10 chars", () => {
    expect(() => ConventionRuleSchema.parse({ ...validRule, text: "Too short" })).toThrow();
  });

  it("rejects text longer than 200 chars", () => {
    expect(() => ConventionRuleSchema.parse({ ...validRule, text: "x".repeat(201) })).toThrow();
  });

  it("rejects invalid severity", () => {
    expect(() => ConventionRuleSchema.parse({ ...validRule, severity: "critical" })).toThrow();
  });

  it("rejects invalid category", () => {
    expect(() => ConventionRuleSchema.parse({ ...validRule, category: "unknown" })).toThrow();
  });
});

describe("ConventionResponseSchema", () => {
  it("accepts response with complianceItems", () => {
    const result = { ...baseResponse, complianceItems: [{ rule: "Use kebab-case", passed: true }] };
    expect(() => ConventionResponseSchema.parse(result)).not.toThrow();
  });

  it("rejects response missing complianceItems", () => {
    expect(() => ConventionResponseSchema.parse(baseResponse)).toThrow();
  });

  it("rejects response with empty complianceItems array", () => {
    expect(() => ConventionResponseSchema.parse({ ...baseResponse, complianceItems: [] })).toThrow();
  });
});

describe("ClaudeResponseSchema", () => {
  it("accepts response without complianceItems", () => {
    expect(() => ClaudeResponseSchema.parse(baseResponse)).not.toThrow();
  });

  it("accepts response with optional complianceItems", () => {
    const result = { ...baseResponse, complianceItems: [{ rule: "Use kebab-case", passed: true }] };
    expect(() => ClaudeResponseSchema.parse(result)).not.toThrow();
  });
});
