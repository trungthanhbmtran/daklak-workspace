"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Activity, BarChart2, Users, Target, Loader2 } from "lucide-react";
import { hrmKpiEvaluationsApi } from "@/features/hrm/api/kpis.api";
import apiClient from "@/lib/axiosInstance";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9'];

export function KpiDashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Fetch periods
  const { data: periodsData } = useQuery({
    queryKey: ["hrm-kpi-periods"],
    queryFn: () => apiClient.get("/hrm/kpis/periods").then((res: any) => res.data || []),
  });

  // Fetch stats based on selected period
  const { data: statsData, isFetching } = useQuery({
    queryKey: ["hrm-kpi-dashboard-stats", selectedPeriod],
    queryFn: async () => {
      if (!selectedPeriod) return null;
      const res = await hrmKpiEvaluationsApi.getDashboardStats({ periodId: selectedPeriod });
      return res?.data || null;
    },
    enabled: !!selectedPeriod,
  });

  const chartData = statsData?.statsByUnit || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-8 h-8 text-indigo-600" />
            Dashboard KPI Tổng Hợp
          </h2>
          <p className="text-slate-500 font-medium mt-2">
            Báo cáo kết quả thực hiện, điểm KPI trung bình theo từng Phòng/Ban/Đơn vị
          </p>
        </div>

        <div className="w-full md:w-[300px]">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-11 bg-white rounded-xl shadow-sm border-slate-200 font-medium">
              <SelectValue placeholder="Chọn kỳ đánh giá..." />
            </SelectTrigger>
            <SelectContent>
              {periodsData?.map((p: any) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedPeriod ? (
        <Card className=" shadow-sm bg-slate-50 border-dashed border-2 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <Target className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Vui lòng chọn Kỳ đánh giá</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Dữ liệu thống kê KPI sẽ được tính toán và hiển thị tự động dựa trên kỳ đánh giá bạn chọn.</p>
          </CardContent>
        </Card>
      ) : isFetching ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : statsData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-400 to-emerald-600"></div>
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold text-emerald-600 uppercase tracking-wider text-xs">Tổng nhân sự đã đánh giá</CardDescription>
                <CardTitle className="text-4xl font-black text-slate-800">{statsData.totalEvaluations || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Users className="w-4 h-4" /> Nhân sự trong toàn cơ quan
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm overflow-hidden rounded-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-400 to-purple-600"></div>
              <CardHeader className="pb-2">
                <CardDescription className="font-semibold text-indigo-600 uppercase tracking-wider text-xs">Điểm Trung Bình Toàn Cơ Quan</CardDescription>
                <CardTitle className="text-4xl font-black text-slate-800">{statsData.companyAvgScore || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Activity className="w-4 h-4" /> Dựa trên tổng điểm của tất cả phiếu duyệt
                </div>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Biểu đồ Điểm Trung Bình Theo Đơn Vị</CardTitle>
                  <CardDescription>So sánh tương quan chất lượng công việc giữa các Phòng ban</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="departmentName"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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

              <Card className="col-span-1 border-0 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-800">Bảng Thống Kê Chi Tiết</CardTitle>
                  <CardDescription>Số liệu cụ thể từng nhóm</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead>Tên Phòng/Ban</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-center">Điểm TB</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chartData.map((row: any, idx: number) => (
                        <TableRow key={idx} className="hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-700">{row.departmentName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="bg-slate-100">{row.totalEvaluations} nv</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-bold text-indigo-600">{row.avgScore}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-0 shadow-sm py-12 text-center text-slate-500">
              Chưa có dữ liệu thống kê cho kỳ đánh giá này.
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
