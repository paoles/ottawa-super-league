"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerHistoryChart } from "./player-history-chart";
import { DistributionChart } from "@/components/statistics/distribution-chart";
import { YearlyAveragesChart } from "@/components/charts/yearly-averages-chart";
import { YearDropdown } from "@/components/seasons/year-dropdown";
import type { PlayerProfile, PlayerRound, DistributionBucket } from "@/types";
import type { YearlyAverage } from "@/lib/stats";
import { COURSES } from "@/lib/constants";

const COURSE_COLORS: Record<string, string> = {
  North: "#10b981",
  South: "#f43f5e",
  East: "#3b82f6",
  West: "#f59e0b",
};

const SCORE_BUCKETS = [
  { range: "36-38", min: 36, max: 38 },
  { range: "39-41", min: 39, max: 41 },
  { range: "42-44", min: 42, max: 44 },
  { range: "45-47", min: 45, max: 47 },
  { range: "48-50", min: 48, max: 50 },
  { range: "51-55", min: 51, max: 55 },
  { range: "56-60", min: 56, max: 60 },
  { range: "61+", min: 61, max: 999 },
];

type SortKey = "roundDate" | "course" | "tee" | "score" | "result";
type SortDir = "asc" | "desc";

const SORT_LABELS: Record<SortKey, string> = {
  roundDate: "Date",
  course: "Course",
  tee: "Tee",
  score: "Score",
  result: "Result",
};

interface PlayerProfileClientProps {
  profile: PlayerProfile;
  history: PlayerRound[];
  yearlyAverages: YearlyAverage[];
  selectedYear: number;
  backHref?: string;
  commissionerSlug?: string;
}

export function PlayerProfileClient({
  profile,
  history,
  yearlyAverages,
  selectedYear,
  backHref,
  commissionerSlug,
}: PlayerProfileClientProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("roundDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const router = useRouter();

  const filteredHistory = useMemo(
    () =>
      selectedCourse === "All"
        ? history
        : history.filter((r) => r.course === selectedCourse),
    [history, selectedCourse]
  );

  const summaryStats = useMemo(() => {
    if (filteredHistory.length === 0) return null;
    const scoreValues = filteredHistory.map((r) => r.score);
    const hdcpValues = filteredHistory.map((r) => r.handicapDiff);
    const gp = filteredHistory.length;
    const wins = filteredHistory.filter((r) => r.result === "W").length;
    const losses = filteredHistory.filter((r) => r.result === "L").length;
    const ties = filteredHistory.filter((r) => r.result === "T").length;
    return {
      strokeAvg: Math.round((scoreValues.reduce((a, b) => a + b, 0) / gp) * 10) / 10,
      hdcpAvg: Math.round((hdcpValues.reduce((a, b) => a + b, 0) / gp) * 10) / 10,
      bestRound: Math.min(...scoreValues),
      worstRound: Math.max(...scoreValues),
      wins,
      losses,
      ties,
      winPct: Math.round((wins / gp) * 1000) / 10,
    };
  }, [filteredHistory]);

  const distributionBuckets: DistributionBucket[] = useMemo(() => {
    const scoreValues = filteredHistory.map((r) => r.score);
    return SCORE_BUCKETS.map((b) => ({
      range: b.range,
      count: scoreValues.filter((s) => s >= b.min && s <= b.max).length,
    }));
  }, [filteredHistory]);

  const sortedHistory = useMemo(() => {
    return [...filteredHistory].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "roundDate") cmp = a.roundDate.localeCompare(b.roundDate);
      else if (sortKey === "course") cmp = a.course.localeCompare(b.course);
      else if (sortKey === "tee") cmp = a.tee.localeCompare(b.tee);
      else if (sortKey === "score") cmp = a.score - b.score;
      else if (sortKey === "result") cmp = a.result.localeCompare(b.result);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredHistory, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() =>
            window.history.length > 1
              ? router.back()
              : router.push(backHref ?? "/players")
          }
          className="flex h-16 w-9 shrink-0 items-center justify-center rounded-2xl border-2 border-orange-400 text-orange-500 transition-colors hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary ring-2 ring-primary/20">
          {profile.photoUrl ? (
            <Image
              src={profile.photoUrl}
              alt={profile.name}
              width={64}
              height={64}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-light">{profile.name}</h1>
            {profile.isSocial && <Badge variant="secondary">Social</Badge>}
            {commissionerSlug && profile.slug === commissionerSlug && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-yellow-400 bg-transparent text-[10px] font-bold text-yellow-500">C</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.rank ? `Rank #${profile.rank}` : "Unranked"} &middot;{" "}
            {profile.gp} rounds played
          </p>
        </div>
        <div className="shrink-0">
          <YearDropdown />
        </div>
      </div>

      {profile.gp === 0 ? (
        <>
          <Card className="border-dashed bg-muted/30">
            <CardContent className="px-6 py-10 text-center">
              <p className="text-base font-medium text-foreground">No rounds played in this season.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use the year selector above to view another season.
              </p>
            </CardContent>
          </Card>

          {/* Season Averages by Year */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Season Averages by Year</CardTitle>
            </CardHeader>
            <CardContent>
              <YearlyAveragesChart data={yearlyAverages} selectedYear={selectedYear} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Course filter pills */}
          <div className="mb-6 flex gap-1.5">
            {["All", ...COURSES].map((course) => (
              <button
                key={course}
                onClick={() => setSelectedCourse(course)}
                className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors text-center ${
                  selectedCourse === course
                    ? "text-white"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
                style={
                  selectedCourse === course
                    ? { backgroundColor: course === "All" ? "#186732" : COURSE_COLORS[course] }
                    : undefined
                }
              >
                {course}
              </button>
            ))}
          </div>

          {/* Summary cards */}
          {summaryStats && (
            <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light">{summaryStats.strokeAvg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light">{summaryStats.hdcpAvg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Hdcp</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light text-green-600">{summaryStats.bestRound}</p>
                <p className="text-xs text-muted-foreground">Best</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light text-red-500">{summaryStats.worstRound}</p>
                <p className="text-xs text-muted-foreground">Worst</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light">{summaryStats.winPct.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Win%</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <p className="text-lg font-light">{summaryStats.wins}-{summaryStats.losses}-{summaryStats.ties}</p>
                <p className="text-xs text-muted-foreground">W-L-T</p>
              </CardContent></Card>
            </div>
          )}

          {/* Season History Chart */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Season History
                {selectedCourse !== "All" && (
                  <span className="ml-2 text-sm font-normal" style={{ color: COURSE_COLORS[selectedCourse] }}>
                    &mdash; {selectedCourse}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerHistoryChart history={history} selectedCourse={selectedCourse} />
            </CardContent>
          </Card>

          {/* Course Breakdown tiles — All only */}
          {selectedCourse === "All" && profile.courseStats.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Course Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[...profile.courseStats].sort((a, b) => a.strokeAvg - b.strokeAvg).map((cs) => (
                    <div
                      key={cs.course}
                      className="rounded-lg border p-3 text-center"
                      style={{ borderColor: COURSE_COLORS[cs.course] + "40" }}
                    >
                      <p className="text-sm font-semibold" style={{ color: COURSE_COLORS[cs.course] }}>{cs.course}</p>
                      <p className="mt-1 text-lg font-light">{cs.strokeAvg.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Best: <span className="font-medium text-green-600">{cs.bestRound}</span>
                        {" · "}{cs.gp} rounds
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Distribution */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <DistributionChart data={distributionBuckets} />
            </CardContent>
          </Card>

          {/* Season Averages by Year */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Season Averages by Year</CardTitle>
            </CardHeader>
            <CardContent>
              <YearlyAveragesChart data={yearlyAverages} selectedYear={selectedYear} />
            </CardContent>
          </Card>

          {/* Round History (sortable) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Round History
                {selectedCourse !== "All" && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">&mdash; {selectedCourse}</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {(["roundDate","course","tee","score","result"] as SortKey[]).map((key) => {
                        const isActive = sortKey === key;
                        const centered = key === "score" || key === "result";
                        return (
                          <th
                            key={key}
                            onClick={() => handleSort(key)}
                            className={`cursor-pointer select-none px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground ${centered ? "text-center" : "text-left"}`}
                          >
                            {SORT_LABELS[key]}
                            {isActive && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistory.map((round) => (
                      <tr key={round.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="whitespace-nowrap px-3 py-2">
                          {new Date(round.roundDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-3 py-2">
                          <span className="text-xs font-medium" style={{ color: COURSE_COLORS[round.course] }}>{round.course}</span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{round.tee}</td>
                        <td className="px-3 py-2 text-center font-medium">{round.score}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge
                            variant={round.result === "W" ? "default" : round.result === "T" ? "secondary" : "outline"}
                            className={round.result === "W" ? "bg-primary" : ""}
                          >
                            {round.result}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {sortedHistory.length === 0 && (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No rounds for this course.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}