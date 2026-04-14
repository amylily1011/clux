import { scoreColor, scoreLabel } from "@/lib/scoring";
import type { CLIAudience } from "@/types/evaluation";

interface Props {
  score: number;
  cliName: string;
  summary: string;
  audience: CLIAudience;
}

const AUDIENCE_LABEL: Record<CLIAudience, string> = {
  human: "Human-first",
  scripting: "Scripting-first",
};

export function ScoreCard({ score, cliName, summary, audience }: Props) {
  return (
    <div className="text-center space-y-3">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
        CLUX Score — {cliName}
      </p>
      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
        {AUDIENCE_LABEL[audience]} evaluation
      </span>
      <div className={`text-7xl font-black tabular-nums ${scoreColor(score)}`}>
        {score}
        <span className="text-3xl font-medium text-slate-400">/100</span>
      </div>
      <span
        className={`inline-block text-sm font-semibold px-3 py-1 rounded-full border ${
          score >= 75
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : score >= 50
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-700 border-red-200"
        }`}
      >
        {scoreLabel(score)}
      </span>
      <p className="text-slate-600 text-sm leading-relaxed max-w-prose mx-auto">
        {summary}
      </p>
    </div>
  );
}
