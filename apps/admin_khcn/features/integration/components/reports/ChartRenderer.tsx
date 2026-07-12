"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ChartRendererProps {
  type: 'bar' | 'line' | 'pie' | 'table';
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  height?: number;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export function ChartRenderer({ type, data, xAxisKey, yAxisKey, height = 300 }: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800" style={{ height }}>
        <span className="text-slate-400 text-sm">Chưa có dữ liệu</span>
      </div>
    );
  }

  // Handle Table
  if (type === 'table') {
    // If table, we can just render the raw data.
    const columns = Object.keys(data[0] || {}).slice(0, 6);
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-auto bg-white dark:bg-slate-950" style={{ maxHeight: height }}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col} className="font-semibold text-slate-700 dark:text-slate-300">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columns.map(col => (
                  <TableCell key={col} className="text-slate-600 dark:text-slate-400">{String(row[col])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Common Recharts properties
  const margin = { top: 20, right: 30, left: 20, bottom: 20 };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        {type === 'bar' ? (
          <BarChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey={yAxisKey} fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={60} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line type="monotone" dataKey={yAxisKey} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
          </LineChart>
        ) : (
          <PieChart margin={margin}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={height / 2 - 40}
              fill="#8884d8"
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              label={({ name, percent }: { name?: string | number; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
