interface ScoreRecord {
  id: number;
  roundDate: string;
  course: string;
  score: number;
}

export type Result = "W" | "L" | "T";

export function computeWinLossTie(
  allScores: ScoreRecord[]
): Map<number, Result> {
  const results = new Map<number, Result>();

  // Group scores by (roundDate, course)
  const groups = new Map<string, ScoreRecord[]>();
  for (const s of allScores) {
    const key = `${s.roundDate}|${s.course}`;
    const group = groups.get(key) || [];
    group.push(s);
    groups.set(key, group);
  }

  for (const group of groups.values()) {
    if (group.length === 1) {
      // Solo round — counts as a win
      results.set(group[0].id, "W");
      continue;
    }

    const minScore = Math.min(...group.map((s) => s.score));
    const winnersCount = group.filter((s) => s.score === minScore).length;

    for (const s of group) {
      if (s.score === minScore) {
        results.set(s.id, winnersCount > 1 ? "T" : "W");
      } else {
        results.set(s.id, "L");
      }
    }
  }

  return results;
}
