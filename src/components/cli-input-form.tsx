"use client";

import { useState } from "react";
import type { CLIAudience } from "@/types/evaluation";

interface Props {
  onResult: (result: unknown) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const AUDIENCES: {
  value: CLIAudience;
  label: string;
  description: string;
}[] = [
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
      {/* Audience selector */}
      <div className="space-y-2">
        <label
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: "#8b949e", letterSpacing: "2px" }}
        >
          Primary audience
        </label>
        <div className="grid grid-cols-2 gap-3">
          {AUDIENCES.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setAudience(a.value)}
              className="text-left p-4 rounded-lg transition-all"
              style={{
                background: "#050507",
                border: audience === a.value
                  ? "2px solid #00d992"
                  : "1px solid #3d3a39",
                boxShadow: audience === a.value
                  ? "rgba(0, 217, 146, 0.08) 0px 0px 15px"
                  : "none",
              }}
            >
              <div
                className="font-semibold text-sm"
                style={{ color: audience === a.value ? "#00d992" : "#f2f2f2" }}
              >
                {a.label}
              </div>
              <div className="text-xs mt-1 leading-snug" style={{ color: "#8b949e" }}>
                {a.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={cliText}
          onChange={(e) => setCLIText(e.target.value)}
          placeholder="$ paste your CLI's --help output, man page, or error messages here..."
          className="w-full text-xs font-mono rounded p-4 resize-y min-h-[220px] focus:outline-none transition-colors"
          style={{
            background: "#050507",
            border: "1px solid #3d3a39",
            color: "#f2f2f2",
            lineHeight: 1.6,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
          maxLength={MAX_CHARS}
        />
        <span
          className="absolute bottom-3 right-3 text-xs font-mono"
          style={{ color: "#3d3a39" }}
        >
          {cliText.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
        </span>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || cliText.length < 10}
        className="w-full h-11 rounded text-sm font-semibold transition-opacity font-mono"
        style={{
          background: loading || cliText.length < 10 ? "#1a1a1a" : "#101010",
          color: loading || cliText.length < 10 ? "#3d3a39" : "#2fd6a1",
          border: `1px solid ${loading || cliText.length < 10 ? "#3d3a39" : "#00d992"}`,
          cursor: loading || cliText.length < 10 ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style={{ borderColor: "#3d3a39", borderTopColor: "#00d992" }}
            />
            evaluating...
          </span>
        ) : (
          "$ evaluate CLI"
        )}
      </button>
    </form>
  );
}
