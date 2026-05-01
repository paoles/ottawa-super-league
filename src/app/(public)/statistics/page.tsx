import Link from "next/link";
import { BookOpen } from "lucide-react";
import { StatisticsClient } from "@/components/statistics/statistics-client";
import { YearDropdown } from "@/components/seasons/year-dropdown";
import { getScoreTrends, getCourseBreakdowns } from "@/lib/stats";
import { ACTIVE_SEASON, resolveSeasonParam } from "@/lib/season";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics",
};

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const { year } = await searchParams;
  const season = resolveSeasonParam(year);

  const [trends, courseBreakdowns] = await Promise.all([
    getScoreTrends(season),
    getCourseBreakdowns(season),
  ]);

  const playersHref = season === ACTIVE_SEASON ? "/players" : `/players?year=${season}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="relative">
        <h1
          className="mb-0 text-center text-4xl font-bold text-primary"
          style={{ fontFamily: "var(--font-dancing-script)", WebkitTextStroke: "0.8px currentColor" }}
        >
          Statistics
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

      <StatisticsClient
        trends={trends}
        courseBreakdowns={courseBreakdowns}
        playersHref={playersHref}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/history"
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-sm text-primary transition-colors hover:bg-primary/10"
        >
          <BookOpen className="h-4 w-4" />
          Our History
        </Link>
      </div>
    </div>
  );
}
