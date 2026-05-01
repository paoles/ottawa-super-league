import { like, type SQL } from "drizzle-orm";
import { scores } from "./db/schema";

const envActive = process.env.ACTIVE_SEASON ? parseInt(process.env.ACTIVE_SEASON, 10) : NaN;
export const ACTIVE_SEASON: number = Number.isFinite(envActive) ? envActive : 2026;

export const ARCHIVED_SEASONS: readonly number[] = [2025, 2024, 2023] as const;

export function seasonWhereClause(year: number): SQL {
  return like(scores.roundDate, `${year}-%`);
}

export function getSeasonFromDate(iso: string): number {
  return parseInt(iso.slice(0, 4), 10);
}

export function isArchivedSeason(year: number): boolean {
  return ARCHIVED_SEASONS.includes(year);
}

export function resolveSeasonParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = typeof value === "string" ? parseInt(value, 10) : NaN;
  if (n === ACTIVE_SEASON) return ACTIVE_SEASON;
  if (ARCHIVED_SEASONS.includes(n)) return n;
  return ACTIVE_SEASON;
}
