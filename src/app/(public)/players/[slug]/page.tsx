import { notFound } from "next/navigation";
import { PlayerProfileClient } from "@/components/players/player-profile-client";
import { getPlayerProfile, getPlayerHistory, getActivePlayerSlugs } from "@/lib/stats";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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
  const [profile, history, commissionerRows] = await Promise.all([
    getPlayerProfile(slug),
    getPlayerHistory(slug),
    db.select({ slug: players.slug }).from(players).where(eq(players.isCommissioner, true)).limit(1),
  ]);

  if (!profile || profile.gp === 0) notFound();

  return <PlayerProfileClient profile={profile} history={history} commissionerSlug={commissionerRows[0]?.slug} />;
}