/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface ChartRendererProps {
  type: 'bar' | 'line' | 'pie' | 'table' | 'area' | 'doughnut' | string;
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}

export function ChartRenderer({ type, data, xAxisKey, yAxisKey, xAxisLabel, yAxisLabel, height = 300 }: ChartRendererProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800" style={{ height }}>
        <span className="text-slate-400 text-sm">Chưa có dữ liệu</span>
      </div>
    );
  }

  // Handle Table
  if (type === 'table') {
    const columns = Object.keys(data[0] || {}).slice(0, 6);
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950" style={{ maxHeight: height }}>
        <ResponsiveTable
          data={data}
          keyExtractor={(_, i) => String(i)}
          columns={columns.map(col => ({
            header: col,
            cell: (row: any) => <span className="text-slate-600 dark:text-slate-400">{String(row[col])}</span>
          }))}
        />
      </div>
    );
  }

  const isPie = type === 'pie' || type === 'doughnut';
  
  let chartConfig: ChartConfig = {};
  let processedData = data;

  if (isPie) {
    processedData = data.map((item, index) => {
      // Create a valid CSS variable name by removing spaces/special chars
      const rawKey = String(item[xAxisKey] || `item-${index}`);
      const key = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_');
      
      chartConfig[key] = {
        label: rawKey,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return {
        ...item,
        fill: `var(--color-${key})`,
        _configKey: key, // Keep track of the safe key
      };
    });
    // Add the main value key to config so the tooltip can show its label
    chartConfig[yAxisKey] = {
      label: yAxisLabel || yAxisKey,
    };
  } else {
    chartConfig = {
      [yAxisKey]: {
        label: yAxisLabel || yAxisKey,
        color: "hsl(var(--chart-1))",
      },
    };
  }

  return (
    <div style={{ width: '100%', height }}>
      <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
        {type === 'bar' ? (
          <BarChart data={data} margin={{ left: -20, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={yAxisKey} fill={`var(--color-${yAxisKey})`} radius={[4, 4, 0, 0]} maxBarSize={50} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data} margin={{ left: -20, right: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey={yAxisKey} stroke={`var(--color-${yAxisKey})`} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart data={data} margin={{ left: -20, right: 12 }}>
            <defs>
              <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={`var(--color-${yAxisKey})`} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={`var(--color-${yAxisKey})`} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey={xAxisKey} 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              className="text-xs text-muted-foreground"
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey={yAxisKey} stroke={`var(--color-${yAxisKey})`} fillOpacity={1} fill="url(#fillArea)" />
          </AreaChart>
        ) : isPie ? (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={type === 'doughnut' ? height / 2 - 60 : 0}
              outerRadius={height / 2 - 20}
              dataKey={yAxisKey}
              nameKey="_configKey"
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend
              content={<ChartLegendContent />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        ) : (
          <div className="flex items-center justify-center w-full h-full text-muted-foreground">
            Biểu đồ không được hỗ trợ
          </div>
        )}
      </ChartContainer>
    </div>
  );
}
