import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ChevronLeft } from "lucide-react";
import { ARCHIVED_SEASONS } from "@/lib/season";
import { SeasonSwitcher } from "@/components/seasons/season-switcher";

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
      <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <Archive className="h-4 w-4 shrink-0" />
            <span className="font-medium">{year} Season Archive</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <SeasonSwitcher current={year} />
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-white/70 px-3 py-1 font-medium text-amber-900 transition-colors hover:bg-white dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Live season
            </Link>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}
