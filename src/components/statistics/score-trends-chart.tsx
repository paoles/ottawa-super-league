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
  Legend,
} from "recharts";
import { PAR } from "@/lib/constants";
import type { ScoreTrendPoint } from "@/types";

interface ScoreTrendsChartProps {
  data: ScoreTrendPoint[];
}

const PLAYER_COLORS = [
  "#1b6b2f",
  "#f05a1e",
  "#5ab035",
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#d97706",
  "#dc2626",
  "#6366f1",
];

export function ScoreTrendsChart({ data }: ScoreTrendsChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const playerNames = [...new Set(data.map((d) => d.playerName))];
  const dates = [...new Set(data.map((d) => d.date))].sort();

  // Pivot: one row per date with per-player scores + league average
  const chartData = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    const dayScores: number[] = [];
    for (const name of playerNames) {
      const scores = data
        .filter((d) => d.date === date && d.playerName === name)
        .map((d) => d.score);
      if (scores.length > 0) {
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        row[name] = avg;
        dayScores.push(avg);
      }
    }
    if (dayScores.length > 0) {
      row["League Avg"] =
        Math.round((dayScores.reduce((a, b) => a + b, 0) / dayScores.length) * 10) / 10;
    }
    return row;
  });

  // Linear regression trendline on League Avg
  const leaguePoints = chartData
    .map((r, i) => ({ x: i, y: r["League Avg"] as number | undefined }))
    .filter((p): p is { x: number; y: number } => p.y !== undefined);
  const n = leaguePoints.length;
  const trendLine: (number | undefined)[] = new Array(chartData.length).fill(undefined);
  if (n >= 2) {
    const sumX = leaguePoints.reduce((s, p) => s + p.x, 0);
    const sumY = leaguePoints.reduce((s, p) => s + p.y, 0);
    const sumXY = leaguePoints.reduce((s, p) => s + p.x * p.y, 0);
    const sumX2 = leaguePoints.reduce((s, p) => s + p.x * p.x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    chartData.forEach((_, i) => {
      trendLine[i] = Math.round((slope * i + intercept) * 10) / 10;
    });
    chartData.forEach((row, i) => {
      row["Trend"] = trendLine[i]!;
    });
  }

  const tickInterval = isMobile
    ? Math.max(0, Math.ceil(dates.length / 5) - 1)
    : Math.max(0, Math.ceil(dates.length / 10) - 1);

  return (
    <div>
      <div className="h-[280px] w-full sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ left: -8, right: 20, bottom: -8 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: isMobile ? 11 : 13 }}
              interval={tickInterval}
              tickFormatter={(v) => {
                const d = new Date(v + "T00:00:00");
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis domain={[30, 65]} tick={{ fontSize: isMobile ? 11 : 13 }} width={30} />
            <Tooltip
              labelFormatter={(v) => {
                const d = new Date(v + "T00:00:00");
                return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            {!isMobile && (
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value) => (value === "League Avg" ? "League Avg" : value)}
              />
            )}
            <ReferenceLine
              y={PAR}
              stroke="#aaa"
              strokeDasharray="3 3"
              label={{ value: "Par", fontSize: 11, fill: "#aaa", position: "insideTopRight" }}
            />
            {/* Individual player lines — thin + faded background context */}
            {playerNames.map((name, i) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]}
                strokeWidth={1}
                strokeOpacity={isMobile ? 0.55 : 0.35}
                dot={false}
                connectNulls
                legendType="none"
              />
            ))}
            {/* Trendline — dashed, sits behind League Avg */}
            {n >= 2 && (
              <Line
                name="Trend"
                type="linear"
                dataKey="Trend"
                stroke="#186732"
                strokeWidth={1.5}
                strokeOpacity={0.5}
                strokeDasharray="6 3"
                dot={false}
                legendType="none"
              />
            )}
            {/* League average — always shown, bold */}
            <Line
              name="League Avg"
              type="monotone"
              dataKey="League Avg"
              stroke="#186732"
              strokeWidth={isMobile ? 2.5 : 3}
              dot={{ r: isMobile ? 3 : 4, fill: "#186732", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {isMobile && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          League average score per round date
        </p>
      )}
    </div>
  );
}
