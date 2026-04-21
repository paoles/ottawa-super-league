import { notFound } from "next/navigation";
import { StatisticsClient } from "@/components/statistics/statistics-client";
import { getScoreTrends, getCourseBreakdowns } from "@/lib/stats";
import { ARCHIVED_SEASONS } from "@/lib/season";
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
  return { title: `${year} Statistics` };
}

export default async function SeasonStatisticsPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = parseInt(yearParam, 10);
  if (!Number.isFinite(year) || !ARCHIVED_SEASONS.includes(year)) notFound();

  const [trends, courseBreakdowns] = await Promise.all([
    getScoreTrends(year),
    getCourseBreakdowns(year),
  ]);

  return (
    <StatisticsClient
      trends={trends}
      courseBreakdowns={courseBreakdowns}
      titleOverride={`${year} Statistics`}
      playersHref={`/seasons/${year}/players`}
      archiveSectionLinks={{
        leaderboardHref: `/seasons/${year}`,
        playersHref: `/seasons/${year}/players`,
        year,
      }}
    />
  );
}
