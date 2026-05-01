"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_SEASON, ARCHIVED_SEASONS } from "@/lib/season";

const ALL_YEARS: number[] = [ACTIVE_SEASON, ...ARCHIVED_SEASONS];

export function YearDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get("year");
  const parsed = raw ? parseInt(raw, 10) : NaN;
  const current = ALL_YEARS.includes(parsed) ? parsed : ACTIVE_SEASON;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const year = parseInt(e.target.value, 10);
    if (year === ACTIVE_SEASON) {
      router.push(pathname);
    } else {
      router.push(`${pathname}?year=${year}`);
    }
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Select season"
      className="cursor-pointer rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary shadow-sm transition-colors hover:border-primary/50 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {ALL_YEARS.map((y) => (
        <option key={y} value={y}>
          {y === ACTIVE_SEASON ? `${y} · Live` : `${y}`}
        </option>
      ))}
    </select>
  );
}
