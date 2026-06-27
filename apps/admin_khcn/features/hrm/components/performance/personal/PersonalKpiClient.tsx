"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Award, Target, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import { useCalculatePersonalKpi } from "@/features/hrm/hooks/useKpis";
import apiClient from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function PersonalKpiClient() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  // Lấy danh sách các kỳ KPI
  const { data: periodsData } = useQuery({
    queryKey: ["hrm-kpi-periods"],
    queryFn: () => apiClient.get("/hrm/kpis/periods").then((res: any) => res.data?.data || []),
  });

  const calculateMutation = useCalculatePersonalKpi();

  const handleCalculate = () => {
    if (!selectedPeriod) {
      toast.error("Vui lòng chọn kỳ đánh giá");
      return;
    }

    calculateMutation.mutate(
      { periodId: parseInt(selectedPeriod) },
      {
        onSuccess: (res: any) => {
          if (res?.data?.success) {
            toast.success("Tính điểm KPI thành công!");
            setResult(res.data);
          } else {
            toast.error(res?.data?.message || "Có lỗi xảy ra");
          }
        },
        onError: () => {
          toast.error("Không thể kết nối đến máy chủ");
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            KPI Cá nhân
          </h2>
          <p className="text-muted-foreground mt-2">
            Đánh giá hiệu suất và tổng hợp điểm KPI tự động dựa trên kết quả công việc
          </p>
        </div>
      </div>

      <Card className="border-t-4 border-t-blue-600 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Tính điểm KPI
          </CardTitle>
          <CardDescription>
            Chọn kỳ đánh giá để hệ thống quét các công việc (Task) đã hoàn thành và tính điểm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Kỳ đánh giá</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:max-w-[300px]">
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
            <Button
              onClick={handleCalculate}
              disabled={calculateMutation.isPending}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {calculateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 animate-spin" /> Đang tính toán...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" /> Bắt đầu tính
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="md:col-span-1 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Tổng Điểm Đạt Được
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {result.totalScore}
                </div>
                <div className="text-sm font-medium text-blue-800/60 uppercase tracking-widest">
                  Điểm KPI
                </div>
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-600 bg-white/60 px-3 py-1.5 rounded-full shadow-sm">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  Đã tính toán từ {result.tasks?.length || 0} công việc
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Calendar className="h-5 w-5 text-slate-500" />
                Chi Tiết Công Việc (Tasks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.tasks && result.tasks.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Tên công việc</TableHead>
                        <TableHead>Điểm chuẩn</TableHead>
                        <TableHead>Điểm thực tế</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.tasks.map((task: any) => {
                        const isBonus = task.finalScore > task.baseScore;
                        const isPenalty = task.finalScore < task.baseScore;

                        return (
                          <TableRow key={task.taskId} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium max-w-[200px] truncate" title={task.title}>
                              {task.title}
                            </TableCell>
                            <TableCell>{task.baseScore}</TableCell>
                            <TableCell className="font-bold">
                              <span className={isBonus ? "text-emerald-600" : isPenalty ? "text-red-600" : "text-slate-700"}>
                                {task.finalScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              {isBonus ? (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                  Sớm hạn
                                </Badge>
                              ) : isPenalty ? (
                                <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                                  Trễ hạn
                                </Badge>
                              ) : (
                                <Badge variant="outline">Đúng hạn</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
                  <p>Không có công việc nào hoàn thành trong kỳ đánh giá này.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
