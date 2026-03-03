import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
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

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-2xl font-light">Input Score</h1>
      <ScoreForm players={allPlayers} />
    </div>
  );
}
