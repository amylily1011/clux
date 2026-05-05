import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { moonshotai } from "@ai-sdk/moonshotai";
import { ClaudeResponseSchema, ConventionResponseSchema } from "./schema";
import { buildContentPrompt, buildConventionPrompt, SYSTEM_PROMPT } from "./prompt";
import type { EvaluationResult } from "@/types/evaluation";

const PROVIDER = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

const DEFAULTS: Record<string, string> = {
  anthropic: "claude-haiku-4-5-20251001",
  google:    "gemini-2.5-flash",
  kimi:      "kimi-k2.6",
};

function getModel() {
  const modelId = process.env.AI_MODEL ?? DEFAULTS[PROVIDER] ?? DEFAULTS.anthropic;
  if (PROVIDER === "google")    return google(modelId);
  if (PROVIDER === "kimi")      return moonshotai(modelId);
  return anthropic(modelId);
}

const TEMPERATURE = PROVIDER === "kimi" ? 1 : 0;

async function runEval(userPrompt: string): Promise<Omit<EvaluationResult, "audience">> {
  const { text } = await generateText({
    model: getModel(),
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: userPrompt },
    ],
    maxOutputTokens: 8192,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(stripped);
  }

  return ClaudeResponseSchema.parse(parsed);
}

export function evaluateByContent(content: string, audience: string) {
  return runEval(buildContentPrompt(content, audience));
}

export async function evaluateByConvention(conventionRules: string, cliText: string, audience: string) {
  const { text } = await generateText({
    model: getModel(),
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: buildConventionPrompt(conventionRules, cliText, audience) },
    ],
    maxOutputTokens: 8192,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    const stripped = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(stripped);
  }

  return ConventionResponseSchema.parse(parsed);
}
