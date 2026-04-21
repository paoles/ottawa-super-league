import { notFound } from "next/navigation";
import { PlayerProfileClient } from "@/components/players/player-profile-client";
import { getPlayerProfile, getPlayerHistory, getActivePlayerSlugs } from "@/lib/stats";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getActivePlayerSlugs();
  return slugs.map((slug) => ({ slug }));
}

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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [profile, history] = await Promise.all([
    getPlayerProfile(slug),
    getPlayerHistory(slug),
  ]);

  if (!profile || profile.gp === 0) notFound();

  return <PlayerProfileClient profile={profile} history={history} />;
}