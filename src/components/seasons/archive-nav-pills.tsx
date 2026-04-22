"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export function ArchiveNavPills({ year }: { year: number }) {
  const segment = useSelectedLayoutSegment();
  const items: { key: string | null; label: string; shortLabel?: string; href: string }[] = [
    { key: null, label: "Leaderboard", href: `/seasons/${year}` },
    { key: "statistics", label: "Statistics", shortLabel: "Stats", href: `/seasons/${year}/statistics` },
    { key: "players", label: "Players", href: `/seasons/${year}/players` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) => {
        const active = it.key === segment;
        const display = it.shortLabel ? (
          <>
            <span className="sm:hidden">{it.shortLabel}</span>
            <span className="hidden sm:inline">{it.label}</span>
          </>
        ) : it.label;
        if (active) {
          return (
            <span
              key={it.label}
              aria-current="page"
              className="inline-flex items-center rounded-full bg-amber-800 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm dark:bg-amber-600 dark:text-white"
            >
              {display}
            </span>
          );
        }
        return (
          <Link
            key={it.label}
            href={it.href}
            className="inline-flex items-center rounded-full border border-amber-300 bg-white/80 px-2.5 py-0.5 text-xs font-medium text-amber-800 shadow-sm transition-colors hover:border-amber-400 hover:bg-white hover:text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            {display}
          </Link>
        );
      })}
    </div>
  );
}
