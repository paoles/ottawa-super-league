"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTrendsChart } from "./score-trends-chart";
import { DistributionChart } from "./distribution-chart";
import { YearlyAveragesChart } from "@/components/charts/yearly-averages-chart";

import Link from "next/link";
import type { ScoreTrendPoint, CourseBreakdown, DistributionBucket } from "@/types";
import type { YearlyAverage } from "@/lib/stats";
import { COURSES } from "@/lib/constants";

interface StatisticsClientProps {
  trends: ScoreTrendPoint[];
  courseBreakdowns: CourseBreakdown[];
  yearlyAverages: YearlyAverage[];
  selectedYear: number;
  playersHref?: string;
}

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

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function StatisticsClient({
  trends,
  courseBreakdowns,
  yearlyAverages,
  selectedYear,
  playersHref = "/players",
}: StatisticsClientProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("All");

  const filteredTrends = useMemo(
    () => (selectedCourse === "All" ? trends : trends.filter((t) => t.course === selectedCourse)),
    [trends, selectedCourse]
  );

  const summaryStats = useMemo(() => {
    const scoreValues = filteredTrends.map((t) => t.score);
    if (scoreValues.length === 0) return null;
    const avg = Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10;
    const activePlayers = new Set(filteredTrends.map((t) => t.playerName)).size;
    return {
      totalRounds: scoreValues.length,
      avgScore: avg,
      bestRound: Math.min(...scoreValues),
      worstRound: Math.max(...scoreValues),
      medianScore: median(scoreValues),
      activePlayers,
    };
  }, [filteredTrends]);

  const distributionBuckets: DistributionBucket[] = useMemo(() => {
    const scoreValues = filteredTrends.map((t) => t.score);
    return SCORE_BUCKETS.map((b) => ({
      range: b.range,
      count: scoreValues.filter((s) => s >= b.min && s <= b.max).length,
    }));
  }, [filteredTrends]);

  const topFiveRounds = useMemo(
    () =>
      [...filteredTrends]
        .sort((a, b) => a.score - b.score || a.date.localeCompare(b.date))
        .slice(0, 5),
    [filteredTrends]
  );

  return (
    <div>
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

      {trends.length === 0 && (
        <div className="mb-6 rounded-lg border bg-muted/30 px-6 py-10 text-center text-muted-foreground">
          No rounds recorded yet.
        </div>
      )}

      {/* Summary cards */}
      {summaryStats && (
        <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light">{summaryStats.totalRounds}</p>
              <p className="text-xs text-muted-foreground">Rounds</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light">{summaryStats.avgScore.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light text-green-600">{summaryStats.bestRound}</p>
              <p className="text-xs text-muted-foreground">Best Round</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light text-red-500">{summaryStats.worstRound}</p>
              <p className="text-xs text-muted-foreground">Worst Round</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light">{summaryStats.medianScore}</p>
              <p className="text-xs text-muted-foreground">Median</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-light">{summaryStats.activePlayers}</p>
              <p className="text-xs text-muted-foreground">
                {selectedCourse === "All" ? "Players" : "Active Players"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Players CTA */}
      <Card className="mb-6 border-[#186732]/30 bg-[#186732]/5 py-0">
        <CardContent className="flex flex-row items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Looking for individual stats?</p>
            <p className="text-xs text-muted-foreground">Player summary &amp; round history.</p>
          </div>
          <Link
            href={playersHref}
            className="shrink-0 rounded-md bg-[#186732] px-4 py-2 text-center text-xs font-medium text-white hover:bg-[#186732]/90 leading-snug"
          >
            Player Profiles &rarr;
          </Link>
        </CardContent>
      </Card>

      {/* Score Trends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Season History{selectedCourse !== "All" ? ` \u2014 ${selectedCourse}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendsChart data={filteredTrends} />
        </CardContent>
      </Card>

      {/* Course tiles - only for All */}
      {selectedCourse === "All" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Course Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...courseBreakdowns].sort((a, b) => a.avgScore - b.avgScore).map((d) => (
                <div
                  key={d.course}
                  className="rounded-lg border p-3 text-center"
                  style={{ borderColor: COURSE_COLORS[d.course] + "40" }}
                >
                  <p className="text-sm font-semibold" style={{ color: COURSE_COLORS[d.course] }}>
                    {d.course}
                  </p>
                  <p className="mt-1 text-lg font-light">{d.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">avg score</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Best: <span className="text-green-600 font-medium">{d.bestRound}</span>
                    {" \u00b7 "}
                    {d.totalRounds} rounds
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Distribution */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <DistributionChart data={distributionBuckets} />
        </CardContent>
      </Card>

      {/* Top 5 Best Rounds */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Top 5 Best Rounds{selectedCourse !== "All" ? ` \u2014 ${selectedCourse}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">Player</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">Course</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide">Date</th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide">Score</th>
                </tr>
              </thead>
              <tbody>
                {topFiveRounds.map((r, i) => (
                  <tr key={`${r.playerName}-${r.date}-${r.score}`} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-2 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-2 font-medium">{r.playerName}</td>
                    <td className="px-4 py-2">
                      <span
                        className="text-xs font-medium"
                        style={{ color: COURSE_COLORS[r.course] }}
                      >
                        {r.course}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDate(r.date)}</td>
                    <td className="px-4 py-2 text-right font-semibold text-green-600">{r.score}</td>
                  </tr>
                ))}
                {topFiveRounds.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                      No data for this course.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Season Averages by Year */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Season Averages by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <YearlyAveragesChart data={yearlyAverages} selectedYear={selectedYear} />
        </CardContent>
      </Card>

      {/* Footer note */}
      <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3 text-center text-sm text-foreground">
        Use the <span className="font-medium">course filters at the top</span> to narrow all results by course.
      </div>
    </div>
  );
}
