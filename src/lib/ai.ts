import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { ClaudeResponseSchema, ConventionResponseSchema } from "./schema";
import { buildNamePrompt, buildContentPrompt, buildConventionPrompt, SYSTEM_PROMPT } from "./prompt";
import type { EvaluationResult } from "@/types/evaluation";

const PROVIDER = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

const MODELS: Record<string, string> = {
  anthropic: process.env.AI_MODEL ?? "claude-sonnet-4-6",
  google:    process.env.AI_MODEL ?? "gemini-2.0-flash",
};

function getModel() {
  const modelId = MODELS[PROVIDER] ?? MODELS.anthropic;
  if (PROVIDER === "google") return google(modelId);
  return anthropic(modelId);
}

async function runEval(userPrompt: string): Promise<Omit<EvaluationResult, "audience">> {
  const { text } = await generateText({
    model: getModel(),
    temperature: 0,
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

export function evaluateByName(cliName: string, audience: string, docsContent?: string) {
  return runEval(buildNamePrompt(cliName, audience, docsContent));
}

export function evaluateByContent(content: string, audience: string) {
  return runEval(buildContentPrompt(content, audience));
}

export async function evaluateByConvention(conventionRules: string, cliText: string, audience: string) {
  const { text } = await generateText({
    model: getModel(),
    temperature: 0,
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
