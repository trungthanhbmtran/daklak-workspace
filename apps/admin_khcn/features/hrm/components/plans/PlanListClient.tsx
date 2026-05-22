"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye, Edit, Trash2, CalendarDays, Target } from "lucide-react";
import { hrmPlansApi, HrmMasterPlan } from "@/features/hrm/api";

export const PlanListClient = () => {
  const [plans, setPlans] = useState<HrmMasterPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hrmPlansApi.list().then(res => {
      setPlans(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "ACTIVE": return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "DRAFT": return "text-slate-700 bg-slate-50 border-slate-200";
      case "COMPLETED": return "text-blue-700 bg-blue-50 border-blue-200";
      case "CANCELLED": return "text-red-700 bg-red-50 border-red-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const translateStatus = (status: string) => {
    switch(status) {
      case "ACTIVE": return "Đang thực hiện";
      case "DRAFT": return "Bản nháp";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kế hoạch tổng</h1>
          <p className="text-muted-foreground">Quản lý các kế hoạch lớn và phân bổ nguồn lực</p>
        </div>
        <Link href="/services/hrm/plans/create">
          <Button className="bg-slate-900 text-white">
            <Plus className="mr-2 h-4 w-4" /> Kế hoạch mới
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" /> Danh sách kế hoạch
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên kế hoạch</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">Đang tải dữ liệu...</TableCell>
                </TableRow>
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">Chưa có kế hoạch nào</TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="font-semibold text-slate-900">{plan.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-md mt-1">{plan.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <CalendarDays className="w-4 h-4 text-slate-400" />
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString("vi-VN") : "N/A"} - {plan.endDate ? new Date(plan.endDate).toLocaleDateString("vi-VN") : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(plan.status)}`}>
                        {translateStatus(plan.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full" title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
