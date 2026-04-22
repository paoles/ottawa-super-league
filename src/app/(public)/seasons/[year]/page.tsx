import { notFound } from "next/navigation";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardCard } from "@/components/leaderboard/leaderboard-card";
import { getLeaderboardData } from "@/lib/stats";
import { ARCHIVED_SEASONS } from "@/lib/season";
import { SEASON_COMMISSIONERS } from "@/lib/constants";
import { User } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  return ARCHIVED_SEASONS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return { title: `${year} Leaderboard` };
}

export default async function SeasonLeaderboardPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = parseInt(yearParam, 10);
  if (!Number.isFinite(year) || !ARCHIVED_SEASONS.includes(year)) notFound();

  const leaderboard = await getLeaderboardData(year);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        {year} Leaderboard
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>

      {leaderboard.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 px-6 py-10 text-center text-muted-foreground">
          No rounds recorded for the {year} season.
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <LeaderboardTable
              data={leaderboard}
              playerHrefPrefix={`/seasons/${year}/players`}
              commissionerSlug={SEASON_COMMISSIONERS[year]}
            />
          </div>
          <div className="flex flex-col gap-2 md:hidden">
            {leaderboard.map((row) => (
              <LeaderboardCard
                key={row.playerId}
                row={row}
                playerHrefPrefix={`/seasons/${year}/players`}
                commissionerSlug={SEASON_COMMISSIONERS[year]}
              />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          Click a player name to view their {year} stats
        </p>
      </div>
    </div>
  );
}
