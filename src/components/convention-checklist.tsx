"use client";

import type { ComplianceItem } from "@/types/evaluation";

interface Props {
  items: ComplianceItem[];
}

export function ConventionChecklist({ items }: Props) {
  const passed = items.filter((i) => i.passed).length;
  const failed = items.filter((i) => !i.passed).length;

  return (
    <div
      className="rounded-lg p-5 space-y-4 mb-6"
      style={{ background: "#101010", border: "1px solid #3d3a39" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
          Convention Compliance
        </p>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span style={{ color: "#00d992" }}>✓ {passed} passed</span>
          {failed > 0 && <span style={{ color: "#fb565b" }}>✗ {failed} failed</span>}
        </div>
      </div>

      {/* Failed rules only */}
      {failed === 0 ? (
        <p className="text-xs font-mono" style={{ color: "#00d992" }}>All rules pass.</p>
      ) : (
        <ul className="space-y-2">
          {items.filter((item) => !item.passed).map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span
                className="shrink-0 mt-0.5 text-xs font-bold font-mono"
                style={{ color: "#fb565b" }}
              >
                ✗
              </span>
              <div className="space-y-0.5 min-w-0">
                <p style={{ color: "#b8b3b0" }}>{item.rule}</p>
                {item.note && (
                  <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>
                    {item.note}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
