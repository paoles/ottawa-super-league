"use client";

import { ChevronDown } from "lucide-react";
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
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={handleChange}
        aria-label="Select season"
        className="cursor-pointer appearance-none bg-transparent pr-5 text-base font-semibold text-primary focus:outline-none"
      >
        {ALL_YEARS.map((y) => (
          <option key={y} value={y}>
            {`${y}`}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-primary" />
    </div>
  );
}
