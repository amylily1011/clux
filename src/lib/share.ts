import pako from "pako";
import type { EvaluationResult } from "@/types/evaluation";
import { EvaluationResultSchema } from "./schema";

export function encodeResult(result: EvaluationResult): string {
  const json = JSON.stringify(result);
  const compressed = pako.deflate(json);
  // Convert Uint8Array to base64url
  const base64 = btoa(String.fromCharCode(...compressed))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

export function decodeResult(encoded: string): EvaluationResult | null {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = pako.inflate(bytes, { to: "string" });
    const parsed = JSON.parse(json);
    return EvaluationResultSchema.parse(parsed);
  } catch {
    return null;
  }
}
