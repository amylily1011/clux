import "@/lib/http-agent";
import { createHash } from "crypto";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { moonshotai } from "@ai-sdk/moonshotai";
import { ClaudeResponseSchema, ConventionResponseSchema } from "./schema";
import { buildContentPrompt, buildConventionPrompt, SYSTEM_PROMPT } from "./prompt";
import { UNIX_RULES } from "./unix-rules";
import { getCached, setCached } from "./eval-cache";
import type { EvaluationResult } from "@/types/evaluation";
import type { z } from "zod";

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

const TEMPERATURE = 0;

// Changing SYSTEM_PROMPT invalidates all cache entries automatically.
const PROMPT_VERSION = createHash("sha256").update(SYSTEM_PROMPT).digest("hex").slice(0, 8);

// L1: module-scope memory cache (warm instance, zero-latency).
// L2: Supabase eval_cache table (cross-instance persistence).
const memCache = new Map<string, unknown>();

function inputHash(...parts: string[]): string {
  return createHash("sha256").update([PROMPT_VERSION, ...parts].join("\0")).digest("hex");
}

async function lookup<T>(hash: string, schema: { parse: (v: unknown) => T }): Promise<T | null> {
  // L1
  if (memCache.has(hash)) return memCache.get(hash) as T;

  // L2
  const remote = await getCached(hash);
  if (remote !== null) {
    const result = schema.parse(remote);
    memCache.set(hash, result);
    return result;
  }

  return null;
}

function store(hash: string, result: unknown): void {
  memCache.set(hash, result);
  setCached(hash, result); // fire-and-forget
}

function parseJSON(text: string): unknown {
  const strip = (s: string) =>
    s.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    try {
      raw = JSON.parse(strip(text));
    } catch (e) {
      console.error("[clux] AI response not valid JSON. Raw text (first 800 chars):\n", text.slice(0, 800));
      throw e;
    }
  }
  return raw;
}

function validate<T>(schema: { parse: (v: unknown) => T }, raw: unknown, context: string): T {
  try {
    return schema.parse(raw);
  } catch (e) {
    console.error(`[clux] Schema validation failed (${context}). Parsed object:\n`, JSON.stringify(raw).slice(0, 1200));
    throw e;
  }
}

async function generate(prompt: string, maxTokens: number): Promise<string> {
  const { text } = await generateText({
    model: getModel(),
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: prompt },
    ],
    maxOutputTokens: maxTokens,
  });
  return text;
}

export async function evaluateByContent(content: string, audience: string): Promise<Omit<EvaluationResult, "audience">> {
  const hash = inputHash(content, audience, "content");

  const cached = await lookup(hash, ClaudeResponseSchema);
  if (cached) return cached;

  const text   = await generate(buildContentPrompt(content, audience), 8192);
  const result = validate(ClaudeResponseSchema, parseJSON(text), "content");
  store(hash, result);
  return result;
}

export async function evaluateByUnix(cliText: string, audience: string): Promise<z.infer<typeof ConventionResponseSchema>> {
  const hash = inputHash(cliText, audience, "unix");

  const cached = await lookup(hash, ConventionResponseSchema);
  if (cached) return cached;

  const text   = await generate(buildConventionPrompt("", cliText, audience, UNIX_RULES), 8192);
  const result = validate(ConventionResponseSchema, parseJSON(text), "unix");
  store(hash, result);
  return result;
}

export async function evaluateByConvention(
  conventionRules: string,
  cliText: string,
  audience: string,
  _unused = false,
  unixRules?: string,
): Promise<z.infer<typeof ConventionResponseSchema>> {
  const hash = inputHash(conventionRules, cliText, audience, unixRules ?? "", "convention");

  const cached = await lookup(hash, ConventionResponseSchema);
  if (cached) return cached;

  const text   = await generate(buildConventionPrompt(conventionRules, cliText, audience, unixRules), 16000);
  const result = validate(ConventionResponseSchema, parseJSON(text), "convention");
  store(hash, result);
  return result;
}
