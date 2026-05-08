"use client";

import { useState } from "react";
import type { ComplianceItem } from "@/types/evaluation";

interface Props {
  items: ComplianceItem[];
  showToggle?: boolean;
}

type Filter = "org" | "unix" | "both";

export function ConventionChecklist({ items, showToggle = false }: Props) {
  const [filter, setFilter] = useState<Filter>("org");
  const [showPassed, setShowPassed] = useState(false);
  const [showUnverified, setShowUnverified] = useState(false);

  const hasOrg  = items.some((i) => i.type === "org"  || i.type == null);
  const hasUnix = items.some((i) => i.type === "unix");
  const showFilterBar = showToggle && hasOrg && hasUnix;
  const isUnixOnly = hasUnix && !hasOrg;
  const isOrgOnly  = hasOrg  && !hasUnix;

  const visible = items.filter((i) => {
    if (!showFilterBar) return true;
    if (filter === "both") return true;
    if (filter === "unix") return i.type === "unix";
    return i.type === "org" || i.type == null;
  });

  const failedItems     = visible.filter((i) => !i.passed);
  const unverifiedItems = visible.filter((i) =>  i.passed && i.note?.toLowerCase().includes("could not verify"));
  const passedItems     = visible.filter((i) =>  i.passed && !i.note?.toLowerCase().includes("could not verify"));
  const failed     = failedItems.length;
  const unverified = unverifiedItems.length;
  const passed     = passedItems.length;

  const title =
    !showFilterBar      ? "Convention Compliance" :
    filter === "unix"   ? "UNIX Philosophy" :
    filter === "org"    ? "Org Rules" :
                          "All Rules";

  function typeBadge(item: ComplianceItem) {
    if (!item.type || !(showFilterBar && filter === "both")) return null;
    return (
      <span
        className="text-xs font-mono px-1 py-0.5 rounded shrink-0"
        style={{
          color:      item.type === "unix" ? "#2fd6a1" : "#a78bfa",
          background: item.type === "unix" ? "rgba(47,214,161,0.08)" : "rgba(167,139,250,0.08)",
          border:     item.type === "unix" ? "1px solid rgba(47,214,161,0.2)" : "1px solid rgba(167,139,250,0.2)",
        }}
      >
        {item.type === "unix" ? "UNIX philosophy" : "Org rules"}
      </span>
    );
  }

  return (
    <div
      className="rounded-lg p-5 space-y-4 mb-6"
      style={{ background: "#101010", border: "1px solid #3d3a39" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
            {title}
          </p>
          {isUnixOnly && (
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                color: "#2fd6a1",
                background: "rgba(47,214,161,0.08)",
                border: "1px solid rgba(47,214,161,0.2)",
              }}
            >
              UNIX philosophy
            </span>
          )}
          {isOrgOnly && (
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                color: "#a78bfa",
                background: "rgba(167,139,250,0.08)",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              Org rules
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showFilterBar && (
            <div className="flex gap-1 p-0.5 rounded" style={{ background: "#050507", border: "1px solid #3d3a39" }}>
              {(["org", "unix", "both"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-xs font-mono px-2 py-0.5 rounded transition-all"
                  style={{
                    background: filter === f ? "#1a1a1a" : "transparent",
                    color: filter === f ? "#2fd6a1" : "#8b949e",
                    border: filter === f ? "1px solid #3d3a39" : "1px solid transparent",
                  }}
                >
                  {f === "both" ? "Both" : f === "unix" ? "UNIX philosophy" : "Org rules"}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span style={{ color: "#00d992" }}>✓ {passed} passed</span>
            {unverified > 0 && <span style={{ color: "#8b949e" }}>? {unverified} unverified</span>}
            {failed > 0 && <span style={{ color: "#fb565b" }}>✗ {failed} failed</span>}
          </div>
        </div>
      </div>

      {/* Failed items */}
      {failed === 0 ? (
        <p className="text-xs font-mono" style={{ color: "#00d992" }}>All rules pass.</p>
      ) : (
        <ul className="space-y-2">
          {failedItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="shrink-0 mt-0.5 text-xs font-bold font-mono" style={{ color: "#fb565b" }}>✗</span>
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {typeBadge(item)}
                  <p style={{ color: "#b8b3b0" }}>{item.rule}</p>
                </div>
                {item.note && (
                  <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>{item.note}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Unverified items toggle */}
      {unverified > 0 && (
        <div>
          <button
            onClick={() => setShowUnverified((v) => !v)}
            className="text-xs font-mono transition-colors"
            style={{ color: "#3d3a39" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b949e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
          >
            {showUnverified ? "↑ hide unverified" : `↓ ${unverified} unverified`}
          </button>
          {showUnverified && (
            <ul className="space-y-2 mt-3">
              {unverifiedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-0.5 text-xs font-bold font-mono" style={{ color: "#8b949e" }}>?</span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {typeBadge(item)}
                      <p style={{ color: "#4a4a4a" }}>{item.rule}</p>
                    </div>
                    {item.note && (
                      <p className="text-xs leading-relaxed" style={{ color: "#3d3a39" }}>{item.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Passed items toggle */}
      {passed > 0 && (
        <div>
          <button
            onClick={() => setShowPassed((v) => !v)}
            className="text-xs font-mono transition-colors"
            style={{ color: "#3d3a39" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8b949e")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
          >
            {showPassed ? `↑ hide passed` : `↓ ${passed} passed`}
          </button>
          {showPassed && (
            <ul className="space-y-2 mt-3">
              {passedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-0.5 text-xs font-bold font-mono" style={{ color: "#00d992" }}>✓</span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {typeBadge(item)}
                      <p style={{ color: "#4a4a4a" }}>{item.rule}</p>
                    </div>
                    {item.note && (
                      <p className="text-xs leading-relaxed" style={{ color: "#3d3a39" }}>{item.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
