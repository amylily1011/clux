"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export function ConventionGate({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Placeholder — wire to a real waitlist endpoint or Stripe later
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(5,5,7,0.85)" }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-xl p-6 space-y-5"
        style={{
          background: "#0d0d0f",
          border: "1px solid #3d3a39",
          boxShadow: "0 0 40px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-full"
            style={{
              color: "#a78bfa",
              background: "rgba(167,139,250,0.12)",
              border: "1px solid rgba(167,139,250,0.3)",
              letterSpacing: "1px",
            }}
          >
            PRO
          </span>
          <button
            onClick={onClose}
            className="text-xs font-mono transition-colors"
            style={{ color: "#3d3a39" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b949e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
          >
            ✕
          </button>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold" style={{ color: "#f2f2f2", fontFamily: "system-ui" }}>
            Convention mode
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#8b949e" }}>
            Check any command against your org&apos;s CLI design rules — flag violations, score compliance, and get targeted fixes.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-2">
          {[
            "Check commands against your own style guide",
            "Pass/fail per rule with targeted recommendations",
            "Scoped UX scoring for the specific command",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "#b8b3b0" }}>
              <span style={{ color: "#a78bfa" }} className="shrink-0 mt-0.5">✦</span>
              {f}
            </li>
          ))}
        </ul>

        <div style={{ borderTop: "1px solid #1a1a1a" }} className="pt-4 space-y-3">
          {!submitted ? (
            <>
              <p className="text-xs font-mono" style={{ color: "#8b949e" }}>
                Get early access — leave your email and we&apos;ll reach out.
              </p>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 text-xs px-3 py-2.5 rounded font-mono focus:outline-none"
                  style={{
                    background: "#050507",
                    border: "1px solid #3d3a39",
                    color: "#f2f2f2",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#a78bfa")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#3d3a39")}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="text-xs font-mono font-semibold px-4 py-2.5 rounded transition-opacity"
                  style={{
                    background: "rgba(167,139,250,0.15)",
                    border: "1px solid rgba(167,139,250,0.4)",
                    color: "#a78bfa",
                    cursor: loading ? "wait" : "pointer",
                  }}
                >
                  {loading ? "..." : "Join"}
                </button>
              </form>
            </>
          ) : (
            <p className="text-xs font-mono text-center py-1" style={{ color: "#a78bfa" }}>
              ✓ You&apos;re on the list — we&apos;ll be in touch.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
