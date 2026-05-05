"use client";

import { useState } from "react";
import type { CLIAudience, InputMode } from "@/types/evaluation";

interface Props {
  onResult: (result: unknown) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  onModeChange?: (mode: InputMode) => void;
}

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

const MODES: { value: InputMode; label: string; hint: string }[] = [
  { value: "paste",      label: "CLI Command",  hint: "Paste the output of one command (e.g. ppa --help). One command at a time." },
  { value: "convention", label: "Convention",   hint: "Check one command against your org's CLI design rules" },
];

const MAX_CHARS = 12000;

export function CLIInputForm({ onResult, onError, loading, setLoading, onModeChange }: Props) {
  const [mode, setMode] = useState<InputMode>("paste");
  const [audience, setAudience] = useState<CLIAudience>("human");
  const [cliText, setCLIText] = useState("");
  const [conventionRules, setConventionRules] = useState("");

  function isReady() {
    if (mode === "paste")      return cliText.trim().length >= 10;
    if (mode === "convention") return conventionRules.trim().length >= 10 && cliText.trim().length >= 10;
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady()) return;

    setLoading(true);
    onError("");

    const payload =
      mode === "paste"
        ? { inputMode: "paste", cliText: cliText.slice(0, MAX_CHARS), audience }
        : { inputMode: "convention", conventionRules: conventionRules.slice(0, MAX_CHARS), cliText: cliText.slice(0, MAX_CHARS), audience };

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? "Something went wrong."); return; }
      onResult(data);
    } catch {
      onError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Audience */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
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
                border: audience === a.value ? "2px solid #00d992" : "1px solid #3d3a39",
                boxShadow: audience === a.value ? "rgba(0,217,146,0.08) 0px 0px 15px" : "none",
              }}
            >
              <div className="font-semibold text-sm" style={{ color: audience === a.value ? "#00d992" : "#f2f2f2" }}>
                {a.label}
              </div>
              <div className="text-xs mt-1 leading-snug" style={{ color: "#8b949e" }}>
                {a.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input mode tabs */}
      <div className="space-y-3">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "#050507", border: "1px solid #3d3a39" }}>
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setMode(m.value);
                onModeChange?.(m.value);
              }}
              className="flex-1 text-sm py-2 rounded-md font-mono transition-all"
              style={{
                background: mode === m.value ? "#101010" : "transparent",
                color: mode === m.value ? "#2fd6a1" : "#8b949e",
                border: mode === m.value ? "1px solid #3d3a39" : "1px solid transparent",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>
          {MODES.find((m) => m.value === mode)?.hint}
        </p>

        {/* CLI Command textarea */}
        {mode === "paste" && (
          <div className="relative">
            <textarea
              value={cliText}
              onChange={(e) => setCLIText(e.target.value)}
              placeholder="$ ppa --help&#10;&#10;Paste the input and output of one command here..."
              autoFocus
              className="w-full text-xs font-mono rounded p-4 resize-y min-h-[180px] focus:outline-none"
              style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2", lineHeight: 1.6 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
              maxLength={MAX_CHARS}
            />
            <span className="absolute bottom-3 right-3 text-xs font-mono" style={{ color: "#3d3a39" }}>
              {cliText.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
            </span>
          </div>
        )}

        {/* Convention inputs */}
        {mode === "convention" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-mono" style={{ color: "#8b949e" }}>
                Org conventions <span style={{ color: "#3d3a39" }}>(plain text, YAML, or JSON)</span>
              </label>
              <textarea
                value={conventionRules}
                onChange={(e) => setConventionRules(e.target.value)}
                placeholder={"e.g.\n- All commands must use verb-noun format\n- Destructive commands require --dry-run\n- Credentials must come from env vars, not flags\n- All list commands must support --json output"}
                autoFocus
                className="w-full text-xs font-mono rounded p-4 resize-y min-h-[140px] focus:outline-none"
                style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2", lineHeight: 1.6 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
                maxLength={MAX_CHARS}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono" style={{ color: "#8b949e" }}>
                CLI command or help output to check
              </label>
              <textarea
                value={cliText}
                onChange={(e) => setCLIText(e.target.value)}
                placeholder="$ paste the command help output here..."
                className="w-full text-xs font-mono rounded p-4 resize-y min-h-[120px] focus:outline-none"
                style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2", lineHeight: 1.6 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
                maxLength={MAX_CHARS}
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !isReady()}
        className="w-full h-11 rounded text-sm font-semibold font-mono transition-opacity"
        style={{
          background: "#101010",
          color: loading || !isReady() ? "#3d3a39" : "#2fd6a1",
          border: `1px solid ${loading || !isReady() ? "#3d3a39" : "#00d992"}`,
          cursor: loading || !isReady() ? "not-allowed" : "pointer",
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style={{ borderColor: "#3d3a39", borderTopColor: "#00d992" }} />
            evaluating...
          </span>
        ) : "$ evaluate"}
      </button>
    </form>
  );
}
