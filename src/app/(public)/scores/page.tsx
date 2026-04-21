import { db } from "@/lib/db";
import { players, scores } from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";
import { ScoreForm } from "@/components/scores/score-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Input Score",
};

export default async function ScoresPage() {
  const allPlayers = await db
    .select({ id: players.id, name: players.name })
    .from(players)
    .where(eq(players.isActive, true))
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
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        Input Score
      </h1>
      <div className="mx-auto mt-3 mb-8 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>
      <ScoreForm players={playersWithAvg} />
    </div>
  );
}
