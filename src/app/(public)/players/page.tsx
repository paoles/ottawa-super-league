import Link from "next/link";
import { BookOpen } from "lucide-react";
import { PlayerCard } from "@/components/players/player-card";
import { YearDropdown } from "@/components/seasons/year-dropdown";
import { getPlayersWithStats } from "@/lib/stats";
import { ACTIVE_SEASON, resolveSeasonParam } from "@/lib/season";
import { SEASON_COMMISSIONERS } from "@/lib/constants";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players",
};

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const season = resolveSeasonParam(year);

  const allPlayers = await getPlayersWithStats(season);

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

  const sorted = [...allPlayers].sort((a, b) => a.name.localeCompare(b.name));
  const hrefSuffix = season === ACTIVE_SEASON ? "" : `?year=${season}`;

  const historyLink = (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/history"
        className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
      >
        <BookOpen className="h-4 w-4" />
        Our History
      </Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative">
        <h1
          className="text-center text-4xl font-bold text-primary"
          style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
        >
          The Players
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
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-6">
          <div className="w-full rounded-xl border border-primary/20 bg-primary/5 px-6 py-10 text-center">
            <p className="text-lg font-medium text-primary">
              No players have teed it up in {season} yet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This roster fills in as rounds are submitted for the season.
            </p>
          </div>
          {historyLink}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                commissionerSlug={commissionerSlug}
                hrefSuffix={hrefSuffix}
              />
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            {historyLink}
          </div>
        </>
      )}
    </div>
  );
}
