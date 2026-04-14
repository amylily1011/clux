"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CLIAudience, EvaluationRequest } from "@/types/evaluation";

interface Props {
  onResult: (result: unknown) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const INPUT_TYPES: { value: EvaluationRequest["inputType"]; label: string }[] = [
  { value: "help", label: "--help output" },
  { value: "manpage", label: "Man page" },
  { value: "errors", label: "Error messages" },
  { value: "general", label: "General description" },
];

const AUDIENCES: { value: CLIAudience; label: string; description: string }[] = [
  {
    value: "human",
    label: "Human-first",
    description: "Interactive use — discoverability, friendly output, safety prompts",
  },
  {
    value: "scripting",
    label: "Scripting-first",
    description: "Automation & CI — exit codes, parseable output, no interactive prompts",
  },
];

const MAX_CHARS = 12000;

export function CLIInputForm({ onResult, onError, loading, setLoading }: Props) {
  const [cliText, setCLIText] = useState("");
  const [cliName, setCLIName] = useState("");
  const [inputType, setInputType] = useState<EvaluationRequest["inputType"]>("help");
  const [audience, setAudience] = useState<CLIAudience>("human");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cliText.trim() || cliText.length < 10) {
      onError("Please paste at least 10 characters of CLI content.");
      return;
    }

    setLoading(true);
    onError("");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliText: cliText.slice(0, MAX_CHARS),
          cliName: cliName.trim() || undefined,
          inputType,
          audience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        onError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      onResult(data);
    } catch {
      onError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Audience selector — required, primary decision */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Who is this CLI primarily designed for?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              className={`text-left p-3 rounded-xl border-2 transition-colors ${
                audience === a.value
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className={`font-semibold text-sm ${audience === a.value ? "text-indigo-700" : "text-slate-700"}`}>
                {a.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                {a.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input type selector */}
      <div className="flex flex-wrap gap-2">
        {INPUT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setInputType(t.value)}
            className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
              inputType === t.value
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Optional CLI name */}
      <input
        type="text"
        value={cliName}
        onChange={(e) => setCLIName(e.target.value)}
        placeholder="CLI name (optional — we'll detect it)"
        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
        maxLength={100}
      />

      {/* CLI content textarea */}
      <div className="relative">
        <Textarea
          value={cliText}
          onChange={(e) => setCLIText(e.target.value)}
          placeholder={`Paste your CLI's ${
            inputType === "help"
              ? "--help output here…"
              : inputType === "manpage"
              ? "man page here…"
              : inputType === "errors"
              ? "error messages and sample output here…"
              : "description or examples here…"
          }`}
          className="font-mono text-xs min-h-[220px] resize-y bg-slate-950 text-slate-100 border-slate-700 placeholder:text-slate-500 focus-visible:ring-indigo-400"
          maxLength={MAX_CHARS}
        />
        <span className="absolute bottom-2 right-3 text-xs text-slate-500 select-none">
          {cliText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>

      <Button
        type="submit"
        disabled={loading || cliText.length < 10}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Evaluating…
          </span>
        ) : (
          "Evaluate CLI"
        )}
      </Button>
    </form>
  );
}
