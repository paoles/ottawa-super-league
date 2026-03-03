import type { LeaderboardRow, PlayerRound } from "@/types";

function escapeCsvField(value: string | number | null): string {
  if (value === null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(fields: (string | number | null)[]): string {
  return fields.map(escapeCsvField).join(",");
}

export function generateLeaderboardCsv(rows: LeaderboardRow[]): string {
  const header = toCsvRow([
    "GP",
    "Rank",
    "Name",
    "Stroke Avg",
    "Hdcp Avg",
    "Best Round",
    "Worst Round",
    "Median",
    "Wins",
    "Losses",
    "Ties",
    "Win %",
  ]);

  const dataRows = rows.map((r) =>
    toCsvRow([
      r.gp,
      r.rank ?? "—",
      r.name,
      r.strokeAvg.toFixed(2),
      r.hdcpAvg.toFixed(2),
      r.bestRound,
      r.worstRound,
      r.median,
      r.wins,
      r.losses,
      r.ties,
      `${r.winPct.toFixed(2)}%`,
    ])
  );

  return [header, ...dataRows].join("\n");
}

interface ScoreExportRow {
  roundDate: string;
  playerName: string;
  course: string;
  tee: string;
  score: number;
  handicapDiff: number;
  result: string;
}

export function generateScoresCsv(rows: ScoreExportRow[]): string {
  const header = toCsvRow([
    "Round Date",
    "Player Name",
    "Course",
    "Tee",
    "Score",
    "Handicap Diff",
    "Result",
  ]);

  const dataRows = rows.map((r) =>
    toCsvRow([
      r.roundDate,
      r.playerName,
      r.course,
      r.tee,
      r.score,
      r.handicapDiff.toFixed(2),
      r.result,
    ])
  );

  return [header, ...dataRows].join("\n");
}
