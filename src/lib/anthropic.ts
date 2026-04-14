import Anthropic from "@anthropic-ai/sdk";
import { EvaluationResultSchema } from "./schema";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";
import type { EvaluationResult } from "@/types/evaluation";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function evaluateCLI(
  cliText: string,
  cliName: string | undefined,
  inputType: string,
  audience: string
): Promise<EvaluationResult> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(cliText, cliName, inputType, audience),
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    // Claude sometimes wraps JSON in markdown — strip fences and retry
    const stripped = textBlock.text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(stripped);
  }

  return EvaluationResultSchema.parse(parsed);
}
