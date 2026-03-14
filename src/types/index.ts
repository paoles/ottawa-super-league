export interface LeaderboardRow {
  playerId: number;
  slug: string;
  name: string;
  isSocial: boolean;
  gp: number;
  rank: number | null;
  strokeAvg: number;
  hdcpAvg: number;
  bestRound: number;
  worstRound: number;
  median: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
}

export interface PlayerProfile {
  id: number;
  name: string;
  slug: string;
  isSocial: boolean;
  photoUrl: string | null;
  gp: number;
  rank: number | null;
  strokeAvg: number;
  hdcpAvg: number;
  bestRound: number;
  worstRound: number;
  median: number;
  wins: number;
  losses: number;
  ties: number;
  winPct: number;
  courseStats: CourseStats[];
}

export interface CourseStats {
  course: string;
  gp: number;
  strokeAvg: number;
  hdcpAvg: number;
  bestRound: number;
  worstRound: number;
}

export interface PlayerRound {
  id: number;
  roundDate: string;
  course: string;
  tee: string;
  score: number;
  handicapDiff: number;
  result: "W" | "L" | "T";
}

export interface ScoreTrendPoint {
  date: string;
  playerName: string;
  score: number;
}

export interface CourseBreakdown {
  course: string;
  avgScore: number;
  bestRound: number;
  avgHdcp: number;
  totalRounds: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

export interface PlayerOption {
  id: number;
  name: string;
  avgScore: number | null;
}
