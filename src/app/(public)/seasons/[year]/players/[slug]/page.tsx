import { notFound } from "next/navigation";
import { PlayerProfileClient } from "@/components/players/player-profile-client";
import {
  getPlayerProfile,
  getPlayerHistory,
  getActivePlayerSlugs,
} from "@/lib/stats";
import { ARCHIVED_SEASONS } from "@/lib/season";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const params: { year: string; slug: string }[] = [];
  for (const year of ARCHIVED_SEASONS) {
    const slugs = await getActivePlayerSlugs(year);
    for (const slug of slugs) {
      params.push({ year: String(year), slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}): Promise<Metadata> {
  const { year, slug } = await params;
  const profile = await getPlayerProfile(slug, parseInt(year, 10));
  return {
    title: profile ? `${profile.name} — ${year}` : `${year} Player`,
  };
}

export default async function SeasonPlayerProfilePage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year: yearParam, slug } = await params;
  const year = parseInt(yearParam, 10);
  if (!Number.isFinite(year) || !ARCHIVED_SEASONS.includes(year)) notFound();

  const [profile, history] = await Promise.all([
    getPlayerProfile(slug, year),
    getPlayerHistory(slug, year),
  ]);

  if (!profile) notFound();

  return (
    <PlayerProfileClient
      profile={profile}
      history={history}
      seasonLabel={String(year)}
      backHref={`/seasons/${year}/players`}
    />
  );
}
