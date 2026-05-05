"use client";

import { useEffect, useState } from "react";
import type { HistoryItem } from "@/lib/history";
import { loadHistory, removeFromHistory } from "@/lib/history";

interface Props {
  open: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}

const MODE_LABEL: Record<string, string> = {
  name:       "Command",
  paste:      "Paste",
  convention: "Convention",
};

const MODE_COLOR: Record<string, string> = {
  name:       "#8b949e",
  paste:      "#8b949e",
  convention: "#a78bfa",
};

function scoreColor(score: number): string {
  if (score >= 75) return "#00d992";
  if (score >= 50) return "#ffba00";
  return "#fb565b";
}

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

export function HistorySidebar({ open, onClose, onRestore }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (open) setItems(loadHistory());
  }, [open]);

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromHistory(id);
    setItems((prev) => prev.filter((h) => h.id !== id));
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60]"
          style={{ background: "rgba(5,5,7,0.7)" }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-[70] flex flex-col"
        style={{
          width: "clamp(280px, 85vw, 360px)",
          background: "#0a0a0c",
          borderLeft: "1px solid #3d3a39",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? "-4px 0 32px rgba(0,0,0,0.6)" : "none",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid #1a1a1a" }}
        >
          <span className="text-xs font-mono uppercase" style={{ color: "#8b949e", letterSpacing: "2px" }}>
            History
          </span>
          <button
            onClick={onClose}
            className="text-xs font-mono transition-colors"
            style={{ color: "#3d3a39" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs font-mono" style={{ color: "#3d3a39" }}>
                No evaluations yet.
              </p>
            </div>
          ) : (
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => { onRestore(item); onClose(); }}
                  className="group flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid #1a1a1a" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#101010")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Score bubble */}
                  <span
                    className="text-sm font-black tabular-nums font-mono shrink-0 w-8 text-center"
                    style={{ color: scoreColor(item.score) }}
                  >
                    {item.score}
                  </span>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-mono truncate" style={{ color: "#f2f2f2" }}>
                      {item.cliName}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-mono px-1.5 py-0.5 rounded"
                        style={{
                          color: MODE_COLOR[item.inputMode],
                          background: "rgba(139,148,158,0.08)",
                          border: "1px solid #1a1a1a",
                        }}
                      >
                        {MODE_LABEL[item.inputMode]}
                      </span>
                      <span className="text-xs font-mono" style={{ color: "#3d3a39" }}>
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="shrink-0 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#3d3a39" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#fb565b")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#3d3a39")}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
