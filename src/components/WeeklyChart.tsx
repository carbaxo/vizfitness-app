"use client";

import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point {
  week: string;
  volumen: number;
  sesiones: number;
  km: number;
}

export default function WeeklyChart({ data }: { data: Point[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <XAxis
            dataKey="week"
            tick={{ fill: "#A79B8D", fontSize: 11 }}
            axisLine={{ stroke: "#332A23" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="vol"
            tick={{ fill: "#A79B8D", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis yAxisId="km" orientation="right" hide />
          <Tooltip
            contentStyle={{
              background: "#251F1A",
              border: "1px solid #463A30",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#E8E1D9" }}
            formatter={(value: number, name: string) => {
              if (name === "volumen") return [`${value.toLocaleString("es-ES")} kg`, "Volumen"];
              if (name === "km") return [`${value} km`, "Cardio"];
              return [value, name];
            }}
          />
          {/* Turquesa para el volumen de gimnasio y naranja para los km de
              cardio: son complementarios, así las dos series se separan sin
              tener que mirar la leyenda. */}
          <Bar
            yAxisId="vol"
            dataKey="volumen"
            fill="#2DC5C9"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
          <Line
            yAxisId="km"
            dataKey="km"
            stroke="#FF8A1F"
            strokeWidth={2.5}
            dot={{ fill: "#FF8A1F", r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
