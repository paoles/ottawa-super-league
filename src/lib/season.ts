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
