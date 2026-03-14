"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import type { ForecastPoint } from "@/types/treasury";

export function CashTrendChart({ data }: { data: ForecastPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(35,48,85,0.12)" />
          <XAxis dataKey="week" stroke="#7b8296" tickLine={false} axisLine={false} />
          <YAxis stroke="#7b8296" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 20,
              border: "1px solid rgba(211, 201, 185, 0.8)",
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 24px 60px rgba(17,30,64,0.12)"
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#153f7a"
            strokeWidth={3}
            dot={{ fill: "#153f7a", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#14906f"
            strokeWidth={3}
            strokeDasharray="8 6"
            dot={{ fill: "#14906f", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
