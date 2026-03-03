"use client";

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
  // Get unique players and dates
  const playerNames = [...new Set(data.map((d) => d.playerName))];
  const dates = [...new Set(data.map((d) => d.date))].sort();

  // Pivot data: one row per date, one column per player
  const chartData = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    for (const name of playerNames) {
      const scores = data
        .filter((d) => d.date === date && d.playerName === name)
        .map((d) => d.score);
      if (scores.length > 0) {
        // If multiple scores on same date, average them
        row[name] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      }
    }
    return row;
  });

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis domain={[30, 65]} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <Legend />
          <ReferenceLine
            y={PAR}
            stroke="#999"
            strokeDasharray="3 3"
            label={{ value: "Par", fontSize: 11, fill: "#999" }}
          />
          {playerNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={PLAYER_COLORS[i % PLAYER_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
