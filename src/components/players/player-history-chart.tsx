"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { PAR } from "@/lib/constants";
import type { PlayerRound } from "@/types";

interface PlayerHistoryChartProps {
  rounds: PlayerRound[];
}

export function PlayerHistoryChart({ rounds }: PlayerHistoryChartProps) {
  const chartData = [...rounds]
    .sort((a, b) => a.roundDate.localeCompare(b.roundDate))
    .map((r) => ({
      date: r.roundDate,
      score: r.score,
      course: r.course,
    }));

  if (chartData.length < 2) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Not enough rounds to display a chart.
      </p>
    );
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, props: any) => [
              value,
              props?.payload?.course ?? "Score",
            ]}
          />
          <ReferenceLine
            y={PAR}
            stroke="#999"
            strokeDasharray="3 3"
            label={{ value: "Par", fontSize: 11, fill: "#999" }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#186732"
            strokeWidth={2}
            dot={{ r: 4, fill: "#186732" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
