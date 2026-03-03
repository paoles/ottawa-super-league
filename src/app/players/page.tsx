import { PlayerCard } from "@/components/players/player-card";
import { getPlayersWithStats } from "@/lib/stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
};

export const revalidate = 300;

export default async function PlayersPage() {
  const players = await getPlayersWithStats();

  // Sort by stroke avg (lower is better), players with 0 GP last
  const sorted = [...players].sort((a, b) => {
    if (a.gp === 0 && b.gp === 0) return a.name.localeCompare(b.name);
    if (a.gp === 0) return 1;
    if (b.gp === 0) return 1;
    return a.strokeAvg - b.strokeAvg;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-light">Players</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((player) => (
          <PlayerCard
            key={player.id}
            name={player.name}
            slug={player.slug}
            isSocial={player.isSocial}
            gp={player.gp}
            strokeAvg={player.strokeAvg}
            hdcpAvg={player.hdcpAvg}
          />
        ))}
      </div>
    </div>
  );
}
