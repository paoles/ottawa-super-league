"use client";

import { usePathname, useRouter } from "next/navigation";
import { ARCHIVED_SEASONS } from "@/lib/season";

export function SeasonSwitcher({ current }: { current: number }) {
  const router = useRouter();
  const pathname = usePathname();

  function targetPath(year: number) {
    const match = pathname.match(/^\/seasons\/\d+\/?(.*)$/);
    const sub = match?.[1] ?? "";
    // Player profile pages: navigate to players list (player may not exist in other season)
    if (sub.startsWith("players/")) return `/seasons/${year}/players`;
    return sub ? `/seasons/${year}/${sub}` : `/seasons/${year}`;
  }

  return (
    <select
      value={current}
      onChange={(e) => router.push(targetPath(parseInt(e.target.value, 10)))}
      className="cursor-pointer rounded-full border border-amber-300 bg-white/80 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm transition-colors hover:border-amber-400 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
    >
      {ARCHIVED_SEASONS.map((y) => (
        <option key={y} value={y}>
          {y} Season
        </option>
      ))}
    </select>
  );
}
