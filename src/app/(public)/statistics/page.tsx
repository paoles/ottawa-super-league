import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTrendsChart } from "@/components/statistics/score-trends-chart";
import { CourseBreakdownChart } from "@/components/statistics/course-breakdown-chart";
import { DistributionChart } from "@/components/statistics/distribution-chart";
import { CsvExportButton } from "@/components/shared/csv-export-button";
import {
  getScoreTrends,
  getCourseBreakdowns,
  getScoreDistribution,
  getLeagueSummary,
} from "@/lib/stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Statistics",
};

export const revalidate = 300;

export default async function StatisticsPage() {
  const [trends, courseBreakdowns, distribution, summary] = await Promise.all([
    getScoreTrends(),
    getCourseBreakdowns(),
    getScoreDistribution(),
    getLeagueSummary(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-light">Statistics</h1>
        <CsvExportButton type="scores" label="Export Scores" />
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-light">{summary.totalRounds}</p>
            <p className="text-xs text-muted-foreground">Total Rounds</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-light">{summary.totalPlayers}</p>
            <p className="text-xs text-muted-foreground">Players</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-light">{summary.lowestScore}</p>
            <p className="text-xs text-muted-foreground">Lowest Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-light">
              {summary.leagueAvg.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">League Average</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Trends */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-light">
            Score Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendsChart data={trends} />
        </CardContent>
      </Card>

      {/* Course Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-light">
            Course-by-Course Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CourseBreakdownChart data={courseBreakdowns} />
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-light">
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DistributionChart data={distribution} />
        </CardContent>
      </Card>
    </div>
  );
}
