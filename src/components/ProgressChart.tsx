"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  label: string;
  peso: number;
  rm: number;
}

export default function ProgressChart({ data }: { data: Point[] }) {
  return (
    <div className="mt-3 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: "#A79B8D", fontSize: 11 }}
            axisLine={{ stroke: "#332A23" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#A79B8D", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "#251F1A",
              border: "1px solid #463A30",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#E8E1D9" }}
            formatter={(value: number, name: string) => [
              `${value} kg`,
              name === "peso" ? "Mejor peso" : "1RM estimado",
            ]}
          />
          <Line
            dataKey="peso"
            stroke="#FF6F00"
            strokeWidth={2.5}
            dot={{ fill: "#FF6F00", r: 3 }}
          />
          <Line
            dataKey="rm"
            stroke="#2DC5C9"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
