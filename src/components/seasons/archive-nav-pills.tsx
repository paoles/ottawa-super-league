"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export function ArchiveNavPills({ year }: { year: number }) {
  const segment = useSelectedLayoutSegment();
  const items: { key: string | null; label: string; href: string }[] = [
    { key: null, label: "Leaderboard", href: `/seasons/${year}` },
    { key: "statistics", label: "Statistics", href: `/seasons/${year}/statistics` },
    { key: "players", label: "Players", href: `/seasons/${year}/players` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) => {
        const active = it.key === segment;
        if (active) {
          return (
            <span
              key={it.label}
              aria-current="page"
              className="inline-flex items-center rounded-full bg-amber-900/15 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-100/10 dark:text-amber-100"
            >
              {it.label}
            </span>
          );
        }
        return (
          <Link
            key={it.label}
            href={it.href}
            className="inline-flex items-center rounded-full border border-amber-300 bg-white/70 px-2.5 py-0.5 text-xs font-medium text-amber-900 transition-colors hover:bg-white dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/50"
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
