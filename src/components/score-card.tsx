import type { CLIAudience } from "@/types/evaluation";

interface Props {
  score: number;
  cliName: string;
  summary: string;
  audience: CLIAudience;
}

const AUDIENCE_LABEL: Record<CLIAudience, string> = {
  human: "human-first",
  scripting: "scripting-first",
};

function scoreColor(score: number): string {
  if (score >= 75) return "#00d992";
  if (score >= 50) return "#ffba00";
  return "#fb565b";
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Poor";
  return "Critical";
}

export function ScoreCard({ score, cliName, summary, audience }: Props) {
  const color = scoreColor(score);

  return (
    <div className="space-y-4">
      {/* CLI name + audience */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono" style={{ color: "#8b949e" }}>
          {cliName}
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded"
          style={{ background: "#050507", border: "1px solid #3d3a39", color: "#8b949e" }}
        >
          {AUDIENCE_LABEL[audience]}
        </span>
      </div>

      {/* Score + label inline */}
      <div className="flex items-end gap-3">
        <span
          className="font-black tabular-nums leading-none"
          style={{
            fontFamily: "system-ui",
            fontSize: "5rem",
            color,
            filter: `drop-shadow(0 0 12px ${color}50)`,
            letterSpacing: "-2px",
          }}
        >
          {score}
        </span>
        <div className="pb-2 space-y-1">
          <span
            className="text-lg font-normal"
            style={{ color: "#3d3a39", fontFamily: "system-ui" }}
          >
            /100
          </span>
          <div>
            <span
              className="block text-xs font-mono px-2 py-0.5 rounded"
              style={{
                color,
                background: `${color}12`,
                border: `1px solid ${color}40`,
                letterSpacing: "1px",
              }}
            >
              {scoreLabel(score).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm leading-snug" style={{ color: "#b8b3b0" }}>
        {summary}
      </p>
    </div>
  );
}
