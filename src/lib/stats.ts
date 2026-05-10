import { db } from "./db";
import { players, scores } from "./db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { computeWinLossTie } from "./win-loss";
import { MIN_GAMES_FOR_RANK, COURSES } from "./constants";
import { ACTIVE_SEASON, ARCHIVED_SEASONS, seasonWhereClause } from "./season";
import type {
  LeaderboardRow,
  PlayerProfile,
  PlayerRound,
  ScoreTrendPoint,
  CourseBreakdown,
  DistributionBucket,
  CourseStats,
} from "@/types";

export type YearlyAverage = {
  year: number;
  average: number | null;
  rounds: number;
};

const KNOWN_SEASONS: readonly number[] = [ACTIVE_SEASON, ...ARCHIVED_SEASONS]
  .slice()
  .sort((a, b) => a - b);

function mergeYearlyAverages(
  rows: { year: number; average: number; rounds: number }[]
): YearlyAverage[] {
  const byYear = new Map(rows.map((r) => [r.year, r]));
  return KNOWN_SEASONS.map((y) => {
    const r = byYear.get(y);
    return {
      year: y,
      average: r ? Math.round(r.average * 10) / 10 : null,
      rounds: r ? r.rounds : 0,
    };
  });
}

export async function getLeagueYearlyAverages(): Promise<YearlyAverage[]> {
  const rows = await db
    .select({
      year: sql<number>`CAST(substr(${scores.roundDate}, 1, 4) AS INTEGER)`.as("year"),
      average: sql<number>`AVG(${scores.score})`,
      rounds: sql<number>`COUNT(*)`,
    })
    .from(scores)
    .groupBy(sql`year`);

  return mergeYearlyAverages(
    rows.map((r) => ({ year: Number(r.year), average: Number(r.average), rounds: Number(r.rounds) }))
  );
}

export async function getPlayerYearlyAverages(slug: string): Promise<YearlyAverage[]> {
  const rows = await db
    .select({
      year: sql<number>`CAST(substr(${scores.roundDate}, 1, 4) AS INTEGER)`.as("year"),
      average: sql<number>`AVG(${scores.score})`,
      rounds: sql<number>`COUNT(*)`,
    })
    .from(scores)
    .innerJoin(players, eq(scores.playerId, players.id))
    .where(eq(players.slug, slug))
    .groupBy(sql`year`);

  return mergeYearlyAverages(
    rows.map((r) => ({ year: Number(r.year), average: Number(r.average), rounds: Number(r.rounds) }))
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export async function getLeaderboardData(
  season: number = ACTIVE_SEASON
): Promise<LeaderboardRow[]> {
  const allScores = await db
    .select({
      id: scores.id,
      playerId: scores.playerId,
      roundDate: scores.roundDate,
      course: scores.course,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
    })
    .from(scores)
    .where(seasonWhereClause(season));

  const allPlayers = await db.select().from(players);

  const wlt = computeWinLossTie(allScores);

  // Group scores by player
  const playerScores = new Map<number, typeof allScores>();
  for (const s of allScores) {
    const group = playerScores.get(s.playerId) || [];
    group.push(s);
    playerScores.set(s.playerId, group);
  }

  const rows: LeaderboardRow[] = [];

  for (const player of allPlayers) {
    const pScores = playerScores.get(player.id) || [];
    const gp = pScores.length;

    if (gp === 0) continue;

    const scoreValues = pScores.map((s) => s.score);
    const hdcpValues = pScores.map((s) => s.handicapDiff);

    let wins = 0,
      losses = 0,
      ties = 0;
    for (const s of pScores) {
      const result = wlt.get(s.id);
      if (result === "W") wins++;
      else if (result === "L") losses++;
      else if (result === "T") ties++;
    }

    rows.push({
      playerId: player.id,
      slug: player.slug,
      name: player.name,
      isSocial: player.isSocial,
      gp,
      rank: null,
      strokeAvg:
        Math.round((scoreValues.reduce((a, b) => a + b, 0) / gp) * 100) / 100,
      hdcpAvg:
        Math.round((hdcpValues.reduce((a, b) => a + b, 0) / gp) * 100) / 100,
      bestRound: Math.min(...scoreValues),
      worstRound: Math.max(...scoreValues),
      median: median(scoreValues),
      wins,
      losses,
      ties,
      winPct: Math.round((wins / gp) * 10000) / 100,
    });
  }

  // Sort: ranked players (>=10 GP) by stroke avg, then unranked by stroke avg
  rows.sort((a, b) => {
    const aRanked = a.gp >= MIN_GAMES_FOR_RANK;
    const bRanked = b.gp >= MIN_GAMES_FOR_RANK;

    if (aRanked && !bRanked) return -1;
    if (!aRanked && bRanked) return 1;

    return a.strokeAvg - b.strokeAvg;
  });

  // Assign ranks
  let rank = 1;
  for (const row of rows) {
    if (row.gp >= MIN_GAMES_FOR_RANK) {
      row.rank = rank++;
    }
  }

  return rows;
}

export async function getPlayerProfile(
  slug: string,
  season: number = ACTIVE_SEASON
): Promise<PlayerProfile | null> {
  const player = await db
    .select()
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  if (player.length === 0) return null;

  const p = player[0];

  const allScores = await db
    .select({
      id: scores.id,
      playerId: scores.playerId,
      roundDate: scores.roundDate,
      course: scores.course,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
    })
    .from(scores)
    .where(seasonWhereClause(season));

  const wlt = computeWinLossTie(allScores);

  const pScores = allScores.filter((s) => s.playerId === p.id);
  const gp = pScores.length;

  if (gp === 0) {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      isSocial: p.isSocial,
      photoUrl: p.photoUrl,
      gp: 0,
      rank: null,
      strokeAvg: 0,
      hdcpAvg: 0,
      bestRound: 0,
      worstRound: 0,
      median: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      winPct: 0,
      courseStats: [],
    };
  }

  const scoreValues = pScores.map((s) => s.score);
  const hdcpValues = pScores.map((s) => s.handicapDiff);

  let wins = 0,
    losses = 0,
    ties = 0;
  for (const s of pScores) {
    const result = wlt.get(s.id);
    if (result === "W") wins++;
    else if (result === "L") losses++;
    else if (result === "T") ties++;
  }

  const leaderboard = await getLeaderboardData(season);
  const playerRow = leaderboard.find((r) => r.playerId === p.id);
  const rank = playerRow?.rank ?? null;

  const courseStats: CourseStats[] = [];
  for (const course of COURSES) {
    const courseScores = pScores.filter((s) => s.course === course);
    if (courseScores.length === 0) continue;

    const cScoreValues = courseScores.map((s) => s.score);
    const cHdcpValues = courseScores.map((s) => s.handicapDiff);

    courseStats.push({
      course,
      gp: courseScores.length,
      strokeAvg:
        Math.round(
          (cScoreValues.reduce((a, b) => a + b, 0) / courseScores.length) * 100
        ) / 100,
      hdcpAvg:
        Math.round(
          (cHdcpValues.reduce((a, b) => a + b, 0) / courseScores.length) * 100
        ) / 100,
      bestRound: Math.min(...cScoreValues),
      worstRound: Math.max(...cScoreValues),
    });
  }

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    isSocial: p.isSocial,
    photoUrl: p.photoUrl,
    gp,
    rank,
    strokeAvg:
      Math.round((scoreValues.reduce((a, b) => a + b, 0) / gp) * 100) / 100,
    hdcpAvg:
      Math.round((hdcpValues.reduce((a, b) => a + b, 0) / gp) * 100) / 100,
    bestRound: Math.min(...scoreValues),
    worstRound: Math.max(...scoreValues),
    median: median(scoreValues),
    wins,
    losses,
    ties,
    winPct: Math.round((wins / gp) * 10000) / 100,
    courseStats,
  };
}

export async function getPlayerHistory(
  slug: string,
  season: number = ACTIVE_SEASON
): Promise<PlayerRound[]> {
  const player = await db
    .select()
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  if (player.length === 0) return [];

  const allScores = await db
    .select({
      id: scores.id,
      playerId: scores.playerId,
      roundDate: scores.roundDate,
      course: scores.course,
      tee: scores.tee,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
    })
    .from(scores)
    .where(seasonWhereClause(season));

  const wlt = computeWinLossTie(allScores);

  return allScores
    .filter((s) => s.playerId === player[0].id)
    .sort((a, b) => b.roundDate.localeCompare(a.roundDate))
    .map((s) => ({
      id: s.id,
      roundDate: s.roundDate,
      course: s.course,
      tee: s.tee,
      score: s.score,
      handicapDiff: s.handicapDiff,
      result: wlt.get(s.id) || "L",
    }));
}

export async function getScoreTrends(
  season: number = ACTIVE_SEASON
): Promise<ScoreTrendPoint[]> {
  const allScores = await db
    .select({
      playerId: scores.playerId,
      roundDate: scores.roundDate,
      course: scores.course,
      score: scores.score,
    })
    .from(scores)
    .where(seasonWhereClause(season))
    .orderBy(asc(scores.roundDate));

  const allPlayers = await db.select().from(players);
  const playerMap = new Map(allPlayers.map((p) => [p.id, p.name]));

  return allScores.map((s) => ({
    date: s.roundDate,
    playerName: playerMap.get(s.playerId) || "Unknown",
    score: s.score,
    course: s.course,
  }));
}

export async function getCourseBreakdowns(
  season: number = ACTIVE_SEASON
): Promise<CourseBreakdown[]> {
  const allScores = await db
    .select({
      course: scores.course,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
    })
    .from(scores)
    .where(seasonWhereClause(season));

  const breakdowns: CourseBreakdown[] = [];

  for (const course of COURSES) {
    const courseScores = allScores.filter((s) => s.course === course);
    if (courseScores.length === 0) continue;

    const scoreValues = courseScores.map((s) => s.score);
    const hdcpValues = courseScores.map((s) => s.handicapDiff);

    breakdowns.push({
      course,
      avgScore:
        Math.round(
          (scoreValues.reduce((a, b) => a + b, 0) / courseScores.length) * 100
        ) / 100,
      bestRound: Math.min(...scoreValues),
      avgHdcp:
        Math.round(
          (hdcpValues.reduce((a, b) => a + b, 0) / courseScores.length) * 100
        ) / 100,
      totalRounds: courseScores.length,
    });
  }

  return breakdowns;
}

export async function getScoreDistribution(
  season: number = ACTIVE_SEASON
): Promise<DistributionBucket[]> {
  const allScores = await db
    .select({ score: scores.score })
    .from(scores)
    .where(seasonWhereClause(season));

  const buckets = [
    { range: "36-38", min: 36, max: 38, count: 0 },
    { range: "39-41", min: 39, max: 41, count: 0 },
    { range: "42-44", min: 42, max: 44, count: 0 },
    { range: "45-47", min: 45, max: 47, count: 0 },
    { range: "48-50", min: 48, max: 50, count: 0 },
    { range: "51-55", min: 51, max: 55, count: 0 },
    { range: "56-60", min: 56, max: 60, count: 0 },
    { range: "61+", min: 61, max: 999, count: 0 },
  ];

  for (const s of allScores) {
    for (const bucket of buckets) {
      if (s.score >= bucket.min && s.score <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  return buckets.map((b) => ({ range: b.range, count: b.count }));
}

export async function getLeagueSummary(season: number = ACTIVE_SEASON) {
  const allScores = await db
    .select({ playerId: scores.playerId, score: scores.score })
    .from(scores)
    .where(seasonWhereClause(season));

  if (allScores.length === 0) {
    return { totalRounds: 0, totalPlayers: 0, lowestScore: 0, leagueAvg: 0 };
  }

  const scoreValues = allScores.map((s) => s.score);
  const activePlayerIds = new Set(allScores.map((s) => s.playerId));

  return {
    totalRounds: allScores.length,
    totalPlayers: activePlayerIds.size,
    lowestScore: Math.min(...scoreValues),
    leagueAvg:
      Math.round(
        (scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100
      ) / 100,
  };
}

export async function getAllPlayerSlugs(): Promise<string[]> {
  const result = await db.select({ slug: players.slug }).from(players);
  return result.map((r) => r.slug);
}

export async function getActivePlayerSlugs(
  season: number = ACTIVE_SEASON
): Promise<string[]> {
  const result = await db
    .selectDistinct({ slug: players.slug })
    .from(scores)
    .innerJoin(players, eq(scores.playerId, players.id))
    .where(seasonWhereClause(season));
  return result.map((r) => r.slug);
}

export async function getPlayersWithStats(season: number = ACTIVE_SEASON) {
  const leaderboard = await getLeaderboardData(season);
  const allPlayers = await db.select().from(players);

  return allPlayers
    .map((p) => {
      const row = leaderboard.find((r) => r.playerId === p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        isSocial: p.isSocial,
        photoUrl: p.photoUrl,
        gp: row?.gp ?? 0,
        strokeAvg: row?.strokeAvg ?? 0,
        hdcpAvg: row?.hdcpAvg ?? 0,
        bestRound: row?.bestRound ?? 0,
        rank: row?.rank ?? null,
      };
    })
    .filter((p) => p.gp > 0);
}

export async function getScoresForExport() {
  const allScores = await db
    .select({
      id: scores.id,
      playerId: scores.playerId,
      roundDate: scores.roundDate,
      course: scores.course,
      tee: scores.tee,
      score: scores.score,
      handicapDiff: scores.handicapDiff,
    })
    .from(scores)
    .orderBy(asc(scores.roundDate));

  const allPlayers = await db.select().from(players);
  const playerMap = new Map(allPlayers.map((p) => [p.id, p.name]));

  const wlt = computeWinLossTie(allScores);

  return allScores.map((s) => ({
    roundDate: s.roundDate,
    playerName: playerMap.get(s.playerId) || "Unknown",
    course: s.course,
    tee: s.tee,
    score: s.score,
    handicapDiff: s.handicapDiff,
    result: wlt.get(s.id) || "L",
  }));
}
