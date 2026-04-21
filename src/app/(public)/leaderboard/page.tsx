import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { getLeaderboardData } from "@/lib/stats";
import { ACTIVE_SEASON } from "@/lib/season";
import Link from "next/link";
import { Archive, BarChart2, User } from "lucide-react";

export const revalidate = 300;

export default async function LeaderboardPage() {
  const leaderboard = await getLeaderboardData();
  const hasScores = leaderboard.some((r) => r.gp > 0);

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

      {hasScores ? (
        <>
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

          {/* Footer hints */}
          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Click a player name to view their individual statistics
            </p>
            <Link
              href="/statistics"
              className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-primary transition-colors hover:bg-primary/10"
            >
              <BarChart2 className="h-4 w-4" />
              View full league statistics
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
            <p className="text-lg font-medium text-primary">
              The {ACTIVE_SEASON} season hasn&apos;t started yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Standings will appear here as scores are submitted.
            </p>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
          >
            <Archive className="h-4 w-4" />
            Browse past seasons
          </Link>
        </div>
      )}
    </div>
  );
}
