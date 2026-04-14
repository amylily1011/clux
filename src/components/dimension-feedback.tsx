import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { scoreColor } from "@/lib/scoring";
import type { DimensionScore } from "@/types/evaluation";

interface Props {
  dimensions: DimensionScore[];
}

const DIMENSION_ICONS: Record<string, string> = {
  Learnability: "📖",
  "Error Tolerance": "⚠️",
  Efficiency: "⚡",
  Safety: "🛡️",
  "UNIX Compliance": "🐚",
  Pleasantness: "✨",
  Security: "🔒",
  Accessibility: "♿",
};

export function DimensionFeedback({ dimensions }: Props) {
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Dimension Breakdown
      </h2>
      <Accordion className="space-y-2">
        {sorted.map((d) => (
          <AccordionItem
            key={d.dimension}
            value={d.dimension}
            className="border border-slate-200 rounded-lg px-4 bg-white"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 w-full">
                <span className="text-lg" aria-hidden="true">
                  {DIMENSION_ICONS[d.dimension] ?? "•"}
                </span>
                <span className="font-medium text-slate-800 flex-1 text-left">
                  {d.dimension}
                </span>
                <span
                  className={`text-lg font-bold tabular-nums mr-2 ${scoreColor(d.score)}`}
                >
                  {d.score}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <p className="text-slate-600 text-sm">{d.summary}</p>

              {d.findings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Findings
                  </p>
                  <ul className="space-y-1">
                    {d.findings.map((f, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-slate-400 mt-0.5 shrink-0">→</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {d.recommendations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Recommendations
                  </p>
                  <ul className="space-y-1">
                    {d.recommendations.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <Badge
                          variant="outline"
                          className="text-indigo-600 border-indigo-200 bg-indigo-50 shrink-0 text-xs h-5"
                        >
                          Fix
                        </Badge>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
