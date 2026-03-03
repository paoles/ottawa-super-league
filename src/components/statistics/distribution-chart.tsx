"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DistributionBucket } from "@/types";

interface DistributionChartProps {
  data: DistributionBucket[];
}

export function DistributionChart({ data }: DistributionChartProps) {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="range" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip
            formatter={(value: any) => [value, "Rounds"]}
            labelFormatter={(label) => `Score: ${label}`}
          />
          <Bar dataKey="count" fill="#1b6b2f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
