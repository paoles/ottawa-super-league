"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CourseBreakdown } from "@/types";

interface CourseBreakdownChartProps {
  data: CourseBreakdown[];
}

const COURSE_COLORS: Record<string, string> = {
  East: "#1b6b2f",
  North: "#5ab035",
  West: "#f05a1e",
  South: "#2563eb",
};

export function CourseBreakdownChart({ data }: CourseBreakdownChartProps) {
  return (
    <div className="space-y-6">
      {/* Average Score */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Average Score by Course
        </h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="course" tick={{ fontSize: 13 }} />
              <YAxis domain={[35, 55]} tick={{ fontSize: 12 }} />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip
                formatter={(value: any) => [Number(value).toFixed(1), "Avg Score"]}
              />
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell
                    key={entry.course}
                    fill={COURSE_COLORS[entry.course] || "#666"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.map((d) => (
          <div
            key={d.course}
            className="rounded-lg border p-3 text-center"
            style={{ borderColor: COURSE_COLORS[d.course] + "40" }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: COURSE_COLORS[d.course] }}
            >
              {d.course}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Best: {d.bestRound} | Rounds: {d.totalRounds}
            </p>
            <p className="text-xs text-muted-foreground">
              Avg Hdcp: {d.avgHdcp.toFixed(1)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
