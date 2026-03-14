"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PAR, COURSES } from "@/lib/constants";
import type { PlayerRound } from "@/types";

const COURSE_COLORS: Record<string, string> = {
  North: "#10b981",
  South: "#f43f5e",
  East: "#3b82f6",
  West: "#f59e0b",
};

interface PlayerHistoryChartProps {
  history: PlayerRound[];
  selectedCourse: string;
}

export function PlayerHistoryChart({ history, selectedCourse }: PlayerHistoryChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // All dates from all history for consistent X-axis
  const allDates = [...new Set(history.map((r) => r.roundDate))].sort();

  // Courses this player has played
  const playerCourses = COURSES.filter((c) => history.some((r) => r.course === c));

  // Pivot: one row per date with per-course scores + overall "Score"
  const chartData = allDates.map((date) => {
    const row: Record<string, string | number> = { date };
    const dayScores: number[] = [];
    for (const course of playerCourses) {
      const round = history.find((r) => r.roundDate === date && r.course === course);
      if (round) {
        row[course] = round.score;
        dayScores.push(round.score);
      }
    }
    if (dayScores.length > 0) {
      row["Score"] = Math.round((dayScores.reduce((a, b) => a + b, 0) / dayScores.length) * 10) / 10;
    }
    return row;
  });

  // Linear regression trendline on main line
  const mainKey = selectedCourse === "All" ? "Score" : selectedCourse;
  const mainColor = selectedCourse === "All" ? "#186732" : COURSE_COLORS[selectedCourse] ?? "#186732";

  // Linear regression trendline on main line
  const trendPoints = chartData
    .map((r, i) => ({ x: i, y: r[mainKey] as number | undefined }))
    .filter((p): p is { x: number; y: number } => p.y !== undefined);
  const tn = trendPoints.length;
  if (tn >= 2) {
    const sumX = trendPoints.reduce((s, p) => s + p.x, 0);
    const sumY = trendPoints.reduce((s, p) => s + p.y, 0);
    const sumXY = trendPoints.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = trendPoints.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (tn * sumXY - sumX * sumY) / (tn * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / tn;
    chartData.forEach((row, i) => {
      row["Trend"] = Math.round((slope * i + intercept) * 10) / 10;
    });
  }

  // Check enough data for the main line
  const mainPoints = chartData.filter((r) => r[mainKey] !== undefined);
  if (mainPoints.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Not enough rounds to display a chart.
      </p>
    );
  }

  const tickInterval = isMobile
    ? Math.max(0, Math.ceil(allDates.length / 5) - 1)
    : Math.max(0, Math.ceil(allDates.length / 10) - 1);

  return (
    <div className="h-[280px] sm:h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ left: -10, right: 10 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: isMobile ? 10 : 12 }}
            interval={tickInterval}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: isMobile ? 10 : 12 }} width={28} />
          <Tooltip
            labelFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
          />
          <ReferenceLine
            y={PAR}
            stroke="#aaa"
            strokeDasharray="3 3"
            label={{ value: "Par", fontSize: 11, fill: "#aaa", position: "insideTopRight" }}
          />
          {/* Per-course background lines — always shown when All, faded when filtered */}
          {playerCourses.map((course) => (
            <Line
              key={course}
              type="monotone"
              dataKey={course}
              stroke={COURSE_COLORS[course]}
              strokeWidth={1.5}
              strokeOpacity={selectedCourse === "All" ? (isMobile ? 0.55 : 0.4) : 0.15}
              dot={{ r: 3, fill: COURSE_COLORS[course], fillOpacity: selectedCourse === "All" ? 0.5 : 0.15, strokeWidth: 0 }}
              connectNulls
              legendType="none"
            />
          ))}
          {/* Trendline */}
          {tn >= 2 && (
            <Line
              name="Trend"
              type="linear"
              dataKey="Trend"
              stroke={mainColor}
              strokeWidth={1.5}
              strokeOpacity={0.5}
              strokeDasharray="6 3"
              dot={false}
              legendType="none"
            />
          )}
          {/* Main line */}
          <Line
            type="monotone"
            dataKey={mainKey}
            stroke={mainColor}
            strokeWidth={isMobile ? 2.5 : 3}
            dot={{ r: isMobile ? 3 : 4, fill: mainColor, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
            legendType="none"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}