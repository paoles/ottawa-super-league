import { notFound } from "next/navigation";
import { PlayerCard } from "@/components/players/player-card";
import { getPlayersWithStats } from "@/lib/stats";
import { ARCHIVED_SEASONS } from "@/lib/season";
import { SEASON_COMMISSIONERS } from "@/lib/constants";
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
  return { title: `${year} Players` };
}

export default async function SeasonPlayersPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = parseInt(yearParam, 10);
  if (!Number.isFinite(year) || !ARCHIVED_SEASONS.includes(year)) notFound();

  const players = await getPlayersWithStats(year);
  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1
        className="text-center text-4xl font-bold text-primary"
        style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
      >
        {year} Players
      </h1>
      <div className="mx-auto mt-3 mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="h-1 w-12 rounded-full bg-primary" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/60" />
      </div>
      {sorted.length === 0 ? (
        <div className="rounded-lg border bg-muted/30 px-6 py-10 text-center text-muted-foreground">
          No players recorded rounds in the {year} season.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              hrefPrefix={`/seasons/${year}/players`}
              commissionerSlug={SEASON_COMMISSIONERS[year]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
