import { notFound } from "next/navigation";
import { PlayerProfileClient } from "@/components/players/player-profile-client";
import { getPlayerProfile, getPlayerHistory } from "@/lib/stats";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ACTIVE_SEASON, resolveSeasonParam } from "@/lib/season";
import { SEASON_COMMISSIONERS } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getPlayerProfile(slug);
  return {
    title: profile?.name || "Player",
  };
}

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const [{ slug }, { year }] = await Promise.all([params, searchParams]);
  const season = resolveSeasonParam(year);

  const [profile, history] = await Promise.all([
    getPlayerProfile(slug, season),
    getPlayerHistory(slug, season),
  ]);

  if (!profile) notFound();

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

  const backHref = season === ACTIVE_SEASON ? "/players" : `/players?year=${season}`;

  return (
    <PlayerProfileClient
      profile={profile}
      history={history}
      backHref={backHref}
      commissionerSlug={commissionerSlug}
    />
  );
}
