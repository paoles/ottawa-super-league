import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { getLeaderboardData } from "@/lib/stats";

export const revalidate = 300;

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        Leaderboard
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <LeaderboardTable data={leaderboard} />
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 md:hidden">
        {leaderboard.map((row) => (
          <LeaderboardCard key={row.playerId} row={row} />
        ))}
      </div>
    </div>
  );
}
