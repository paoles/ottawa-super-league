import { StatisticsClient } from "@/components/statistics/statistics-client";
import { getScoreTrends, getCourseBreakdowns } from "@/lib/stats";
import { ARCHIVED_SEASONS } from "@/lib/season";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics",
};

export const revalidate = 300;

export default async function StatisticsPage() {
  const [trends, courseBreakdowns] = await Promise.all([
    getScoreTrends(),
    getCourseBreakdowns(),
  ]);

  return (
    <StatisticsClient
      trends={trends}
      courseBreakdowns={courseBreakdowns}
      archivedSeasons={ARCHIVED_SEASONS}
    />
  );
}
