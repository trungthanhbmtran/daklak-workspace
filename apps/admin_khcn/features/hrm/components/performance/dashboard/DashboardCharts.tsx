/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDashboardStats } from "./useDashboardStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

export function DashboardCharts({ selectedPeriod }: { selectedPeriod: string }) {
  const { data: statsData, isFetching } = useDashboardStats(selectedPeriod);
  
  if (isFetching || !statsData) return null;
  
  const chartData = statsData.statsByUnit || [];

  if (chartData.length === 0) {
    return (
      <Card className="border-0 shadow-sm py-12 text-center text-muted-foreground bg-card">
        Chưa có dữ liệu thống kê cho kỳ đánh giá này.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-foreground">Biểu đồ Điểm Trung Bình Theo Đơn Vị</CardTitle>
          <CardDescription className="text-muted-foreground">So sánh tương quan chất lượng công việc giữa các Phòng ban</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="departmentName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="avgScore" name="Điểm Trung Bình" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 border-0 shadow-sm rounded-2xl bg-card">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-foreground">Bảng Thống Kê Chi Tiết</CardTitle>
          <CardDescription className="text-muted-foreground">Số liệu cụ thể từng nhóm</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ResponsiveTable
            data={chartData}
            keyExtractor={(_, idx) => String(idx)}
            columns={[
              {
                header: "Tên Phòng/Ban",
                cell: (row: any) => <span className="font-semibold text-foreground">{row.departmentName}</span>
              },
              {
                header: "Số lượng",
                className: "text-center",
                cell: (row: any) => <div className="text-center"><Badge variant="secondary">{row.totalEvaluations} nv</Badge></div>
              },
              {
                header: "Điểm TB",
                className: "text-center",
                cell: (row: any) => <div className="text-center font-medium"><Text as="span" weight="bold" className="text-primary">{row.avgScore}</Text></div>
              }
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
