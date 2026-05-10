"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearlyAverage } from "@/lib/stats";

interface YearlyAveragesChartProps {
  data: YearlyAverage[];
  selectedYear: number;
  color?: string;
}

const DEFAULT_COLOR = "#186732";

export function YearlyAveragesChart({
  data,
  selectedYear,
  color = DEFAULT_COLOR,
}: YearlyAveragesChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const chartData = data.map((d) => ({
    year: String(d.year),
    yearNum: d.year,
    average: d.average,
    hasData: d.average !== null,
    displayAverage: d.average,
    rounds: d.rounds,
  }));

  const presentAverages = data
    .map((d) => d.average)
    .filter((v): v is number => v !== null);
  const dataMin = presentAverages.length > 0 ? Math.min(...presentAverages) : 36;
  const dataMax = presentAverages.length > 0 ? Math.max(...presentAverages) : 60;
  const yMin = Math.floor(dataMin - 4);
  const yMax = Math.ceil(dataMax + 2);

  const mutedFill = color + "59";

  return (
    <div className="h-[220px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ left: -8, right: 16, top: 24, bottom: -8 }}
        >
          <XAxis
            dataKey="year"
            tick={{ fontSize: isMobile ? 12 : 14, fontWeight: 500 }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: isMobile ? 11 : 13 }}
            width={30}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(24, 103, 50, 0.06)" }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((_value: unknown, _name: unknown, item: any) => {
              const p = item?.payload as typeof chartData[number] | undefined;
              if (!p || !p.hasData) return ["No rounds played", "Avg"];
              return [`${p.displayAverage!.toFixed(1)} · ${p.rounds} rounds`, "Avg"];
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any}
          />
          <Bar dataKey="average" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {chartData.map((entry) => (
              <Cell
                key={entry.year}
                fill={entry.yearNum === selectedYear ? color : mutedFill}
              />
            ))}
            <LabelList
              dataKey="displayAverage"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((v: unknown) => (v == null ? "" : (v as number).toFixed(1))) as any}
              style={{ fontSize: isMobile ? 11 : 13, fontWeight: 600, fill: "#374151" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
