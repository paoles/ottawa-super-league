import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { YearDropdown } from "@/components/seasons/year-dropdown";
import { getLeaderboardData } from "@/lib/stats";
import { ACTIVE_SEASON, resolveSeasonParam } from "@/lib/season";
import { SEASON_COMMISSIONERS } from "@/lib/constants";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { BarChart2, BookOpen, User } from "lucide-react";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const season = resolveSeasonParam(year);

  const leaderboard = await getLeaderboardData(season);

  let commissionerSlug: string | undefined;
  if (season === ACTIVE_SEASON) {
    const rows = await db
      .select({ slug: players.slug })
      .from(players)
      .where(eq(players.isCommissioner, true))
      .limit(1);
    commissionerSlug = rows[0]?.slug;
  } else {
    commissionerSlug = SEASON_COMMISSIONERS[season];
  }

  const hasScores = leaderboard.some((r) => r.gp > 0);
  const playerHrefSuffix = season === ACTIVE_SEASON ? "" : `?year=${season}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative">
        <h1
          className="text-center text-4xl font-bold text-primary"
          style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
        >
          Leaderboard
        </h1>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <YearDropdown />
        </div>
      </div>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {hasScores ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <LeaderboardTable data={leaderboard} commissionerSlug={commissionerSlug} playerHrefSuffix={playerHrefSuffix} />
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {leaderboard.map((row) => (
              <LeaderboardCard key={row.playerId} row={row} commissionerSlug={commissionerSlug} playerHrefSuffix={playerHrefSuffix} />
            ))}
          </div>

          {/* Footer hints */}
          <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Click a player name to view their individual statistics
            </p>
            <Link
              href={season === ACTIVE_SEASON ? "/statistics" : `/statistics?year=${season}`}
              className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-primary transition-colors hover:bg-primary/10"
            >
              <BarChart2 className="h-4 w-4" />
              View full league statistics
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/history"
                className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-primary transition-colors hover:bg-primary/10"
              >
                <BookOpen className="h-4 w-4" />
                Our History
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
            <p className="text-lg font-medium text-primary">
              The {season} season hasn&apos;t started yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Standings will appear here as scores are submitted.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/history"
              className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
            >
              <BookOpen className="h-4 w-4" />
              Our History
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
