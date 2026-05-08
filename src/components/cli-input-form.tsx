"use client";

import { useState, useEffect } from "react";
import type { CLIAudience, InputMode } from "@/types/evaluation";
import { loadOrgRules, saveOrgRules, clearOrgRules } from "@/lib/org-rules";

export type EvalPayload = {
  cliText: string;
  conventionRules?: string;
  inputMode: InputMode;
  audience: CLIAudience;
};

interface Props {
  onResult: (result: unknown, payload: EvalPayload) => void;
  onError: (msg: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const AUDIENCES: { value: CLIAudience; label: string; description: string }[] = [
  { value: "human",     label: "Human-first",    description: "Interactive use — discoverability, friendly output, safety prompts" },
  { value: "scripting", label: "Scripting-first", description: "Automation & CI — exit codes, parseable output, no interactive prompts" },
];

const MAX_CHARS       = 12000;
const MAX_CHARS_RULES = 50000;

type Ruleset = "unix" | "custom";

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export function CLIInputForm({ onResult, onError, loading, setLoading }: Props) {
  const [audience,       setAudience]       = useState<CLIAudience>("human");
  const [cliText,        setCLIText]        = useState("");
  const [ruleset,        setRuleset]        = useState<Ruleset>("unix");
  const [draftRules,     setDraftRules]     = useState("");
  const [lastSavedText,  setLastSavedText]  = useState("");
  const [savedAt,        setSavedAt]        = useState<number | null>(null);

  useEffect(() => {
    const saved = loadOrgRules();
    if (saved) {
      setDraftRules(saved.text);
      setLastSavedText(saved.text);
      setSavedAt(saved.savedAt);
      setRuleset("custom");
    }
  }, []);

  const isDirty  = ruleset === "custom" && draftRules.trim() !== lastSavedText.trim() && draftRules.trim().length >= 10;
  const hasSaved = savedAt !== null && lastSavedText.length >= 10;

  function handleSaveRules() {
    const text = draftRules.trim();
    if (text.length < 10) return;
    saveOrgRules(text);
    setLastSavedText(text);
    setSavedAt(Date.now());
  }

  function handleClearRules() {
    clearOrgRules();
    setDraftRules("");
    setLastSavedText("");
    setSavedAt(null);
    setRuleset("unix");
  }

  function isReady() {
    if (cliText.trim().length < 2) return false;
    if (ruleset === "custom" && draftRules.trim().length < 10) return false;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isReady()) return;

    setLoading(true);
    onError("");

    const conventionRules = ruleset === "custom" ? draftRules.trim().slice(0, MAX_CHARS_RULES) : undefined;
    const payload: EvalPayload = {
      cliText: cliText.slice(0, MAX_CHARS),
      conventionRules,
      inputMode: ruleset === "custom" ? "convention" : "paste",
      audience,
    };

    const apiBody = conventionRules
      ? { cliText: payload.cliText, conventionRules, audience }
      : { cliText: payload.cliText, audience };

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiBody),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? "Something went wrong."); return; }
      onResult(data, payload);
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

      {/* CLI Command */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
          CLI Command
        </label>
        <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>
          Type a command name (e.g. multipass find) or paste its help output for a deeper analysis.
        </p>
        <div className="relative">
          <textarea
            value={cliText}
            onChange={(e) => setCLIText(e.target.value)}
            placeholder={"git --help\n\n— or paste the input and output of a command, including error messages, help text, tables, etc. The more context you provide, the better!"}
            autoFocus
            className="w-full text-xs font-mono rounded p-4 resize-y min-h-[180px] focus:outline-none"
            style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2", lineHeight: 1.6 }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "#3d3a39")}
            maxLength={MAX_CHARS}
          />
          <span className="absolute bottom-3 right-3 text-xs font-mono" style={{ color: "#3d3a39" }}>
            {cliText.length.toLocaleString()}/{MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Ruleset */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
            Ruleset
          </label>
          <div className="flex gap-1 p-0.5 rounded" style={{ background: "#050507", border: "1px solid #3d3a39" }}>
            {(["unix", "custom"] as Ruleset[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRuleset(r)}
                className="text-xs font-mono px-2 py-0.5 rounded transition-all"
                style={{
                  background: ruleset === r ? "#1a1a1a" : "transparent",
                  color:      ruleset === r ? "#2fd6a1" : "#8b949e",
                  border:     ruleset === r ? "1px solid #3d3a39" : "1px solid transparent",
                }}
              >
                {r === "unix" ? "UNIX Philosophy" : "Custom Org Rules"}
              </button>
            ))}
          </div>
        </div>

        {ruleset === "unix" && (
          <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>
            Evaluates against 12 built-in UNIX philosophy principles.
          </p>
        )}

        {ruleset === "custom" && (
          <div className="space-y-2">
            <textarea
              value={draftRules}
              onChange={(e) => setDraftRules(e.target.value)}
              placeholder={"e.g.\n- All commands must use verb-noun format\n- Destructive commands require --dry-run\n- Credentials must come from env vars, not flags\n- All list commands must support --json output"}
              className="w-full text-xs font-mono rounded p-4 resize-y min-h-[140px] focus:outline-none"
              style={{ background: "#050507", border: "1px solid #3d3a39", color: "#f2f2f2", lineHeight: 1.6 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#00d992")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "#3d3a39")}
              maxLength={MAX_CHARS_RULES}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveRules}
                  disabled={!isDirty}
                  className="text-xs font-mono transition-colors"
                  style={{ color: isDirty ? "#2fd6a1" : hasSaved ? "#3d3a39" : "#3d3a39", cursor: isDirty ? "pointer" : "default" }}
                >
                  {isDirty
                    ? "↑ save as default"
                    : hasSaved
                      ? `✓ saved ${relativeTime(savedAt!)}`
                      : "save as default"}
                </button>
                {hasSaved && (
                  <button
                    type="button"
                    onClick={handleClearRules}
                    className="text-xs font-mono transition-colors"
                    style={{ color: "#3d3a39" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fb565b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
                  >
                    clear saved
                  </button>
                )}
              </div>
              <span className="text-xs font-mono" style={{ color: "#3d3a39" }}>
                {draftRules.length.toLocaleString()} / {MAX_CHARS_RULES.toLocaleString()}
              </span>
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
          color:  loading || !isReady() ? "#3d3a39" : "#2fd6a1",
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
