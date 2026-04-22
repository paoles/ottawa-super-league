import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ChevronLeft } from "lucide-react";
import { ARCHIVED_SEASONS } from "@/lib/season";
import { SeasonSwitcher } from "@/components/seasons/season-switcher";
import { ArchiveNavPills } from "@/components/seasons/archive-nav-pills";

export default async function SeasonArchiveLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = parseInt(yearParam, 10);
  if (!Number.isFinite(year) || !ARCHIVED_SEASONS.includes(year)) notFound();

  return (
    <>
      <div className="sticky top-16 z-40 border-b border-amber-200 bg-amber-50 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="h-0.5 bg-gradient-to-r from-amber-300/0 via-amber-400 to-amber-300/0 dark:via-amber-700" />
        <div className="mx-auto max-w-5xl px-4 py-2">
          <div className="flex flex-col gap-y-1.5 md:flex-row md:items-center md:justify-between md:gap-x-4">

            {/* Mobile row 1 / Desktop left: archive label + mobile Live link */}
            <div className="flex items-center justify-between md:justify-start md:gap-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <Archive className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-semibold tracking-tight">{year} Season Archive</span>
              </div>
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-50 md:hidden dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Live season
              </Link>
            </div>

            {/* Mobile row 2 / Desktop right: nav pills + switcher + desktop Live link */}
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 md:flex-nowrap md:justify-end md:gap-3">
              <ArchiveNavPills year={year} />
              <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
                <SeasonSwitcher current={year} />
                <Link
                  href="/leaderboard"
                  className="hidden md:inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Live season
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
      {children}
    </>
  );
}
