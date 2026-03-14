import { db } from "@/lib/db";
import { players, scores } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { ScoreForm } from "@/components/scores/score-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Input Score",
};

export default async function ScoresPage() {
  const allPlayers = await db
    .select({ id: players.id, name: players.name })
    .from(players)
    .orderBy(asc(players.name));

  const allScores = await db
    .select({ playerId: scores.playerId, score: scores.score })
    .from(scores);

  // Compute per-player average score
  const sumMap = new Map<number, number>();
  const countMap = new Map<number, number>();
  for (const s of allScores) {
    sumMap.set(s.playerId, (sumMap.get(s.playerId) ?? 0) + s.score);
    countMap.set(s.playerId, (countMap.get(s.playerId) ?? 0) + 1);
  }

  const playersWithAvg = allPlayers.map((p) => ({
    ...p,
    avgScore: countMap.has(p.id)
      ? Math.round(sumMap.get(p.id)! / countMap.get(p.id)!)
      : null,
  }));

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-light">Input Score</h1>
      <ScoreForm players={playersWithAvg} />
    </div>
  );
}
