"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Text } from "@/components/ui/typography";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];

interface ChartProps {
  isLoading: boolean;
  data: any[];
}

export function ProgressByUnitChart({ isLoading, data }: ChartProps) {
  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }
  if (!data || data.length === 0) {
    return <Text variant="muted" className="h-full flex items-center justify-center">Chưa có dữ liệu</Text>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="unitName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
        <Bar dataKey="completed" name="Hoàn thành" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={32} />
        <Bar dataKey="pending" name="Chưa hoàn thành" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatsByLeaderChart({ isLoading, data }: ChartProps) {
  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-slate-400"><Loader2 className="animate-spin h-6 w-6" /></div>;
  }
  if (!data || data.length === 0) {
    return <Text variant="muted" className="h-full flex items-center justify-center">Chưa có dữ liệu</Text>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="leaderName"
          stroke="none"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
