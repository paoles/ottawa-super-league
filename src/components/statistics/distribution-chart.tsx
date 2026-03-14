"use client";

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DistributionBucket } from "@/types";

interface DistributionChartProps {
  data: DistributionBucket[];
}

// Green → yellow → red, one color per bucket (best to worst score)
const BUCKET_COLORS = [
  "#16a34a", // 36-38 — excellent (dark green)
  "#4ade80", // 39-41 — good (light green)
  "#a3e635", // 42-44 — decent (yellow-green)
  "#facc15", // 45-47 — average (yellow)
  "#fb923c", // 48-50 — below avg (orange)
  "#f97316", // 51-55 — poor (deep orange)
  "#ef4444", // 56-60 — bad (red)
  "#dc2626", // 61+   — very bad (dark red)
];

export function DistributionChart({ data }: DistributionChartProps) {
  // Reverse so low/good scores appear at the bottom, matching the score trends Y-axis
  const reversed = [...data].reverse();
  const reversedColors = [...BUCKET_COLORS].reverse();

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={reversed} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
          <YAxis type="category" dataKey="range" tick={{ fontSize: 11 }} width={40} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip
            formatter={(value: any) => [value, "Rounds"]}
            labelFormatter={(label) => `Score: ${label}`}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {reversed.map((_, i) => (
              <Cell key={i} fill={reversedColors[i] ?? reversedColors[reversedColors.length - 1]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
