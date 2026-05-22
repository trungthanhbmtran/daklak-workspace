"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, CalendarDays, Target, BarChart, Sparkles, Import, MoreHorizontal } from "lucide-react";
import { hrmPlansApi } from "@/features/hrm/api";
import { HrmMasterPlan } from "@/features/hrm/types";
import { cn } from "@/lib/utils";

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
    switch (status) {
      case "ACTIVE": return "text-emerald-700 bg-emerald-100/50 border-emerald-200";
      case "DRAFT": return "text-slate-700 bg-slate-100 border-slate-200";
      case "COMPLETED": return "text-blue-700 bg-blue-100/50 border-blue-200";
      case "CANCELLED": return "text-rose-700 bg-rose-100/50 border-rose-200";
      default: return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "ACTIVE": return "Đang thực hiện";
      case "DRAFT": return "Bản nháp";
      case "COMPLETED": return "Hoàn thành";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header Section with Glassmorphism */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              Kế hoạch tổng <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-slate-500 font-medium mt-1">Quản lý và điều phối các dự án chiến lược</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/services/hrm/plans/create">
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold rounded-xl h-11 shadow-sm">
              <Import className="mr-2 h-4 w-4" /> Import Excel
            </Button>
          </Link>
          <Link href="/services/hrm/plans/create">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl h-11 shadow-md shadow-slate-900/20">
              <Plus className="mr-2 h-4 w-4" /> Tạo Kế hoạch mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Target className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Chưa có kế hoạch nào</h3>
          <p className="text-slate-500 max-w-sm mt-2 mb-6">Bạn chưa tạo kế hoạch tổng nào. Hãy bắt đầu bằng cách tạo mới hoặc import từ tệp Excel.</p>
          <Link href="/services/hrm/plans/create">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20">
              Bắt đầu ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="group overflow-hidden border-0 bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm", getStatusColor(plan.status))}>
                    {translateStatus(plan.status)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {plan.title}
                </CardTitle>
                <div className="text-sm text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {plan.description || "Không có mô tả chi tiết."}
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="flex flex-col gap-4">
                  {/* Timeline */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                      <CalendarDays className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Thời hạn</div>
                      <div className="text-sm font-medium text-slate-700">
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString("vi-VN") : "--"}
                        <span className="mx-1 text-slate-300">→</span>
                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString("vi-VN") : "--"}
                      </div>
                    </div>
                  </div>

                  {/* Mock Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <BarChart className="w-3.5 h-3.5" /> Tiến độ (Ước tính)
                      </div>
                      <span className="text-sm font-bold text-indigo-600">45%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4 border-t border-slate-50 flex justify-between gap-2 bg-slate-50/50 group-hover:bg-indigo-50/30 transition-colors">
                <Link href={`/services/hrm/plans/${plan.id}`} className="flex-1">
                  <Button variant="ghost" className="w-full rounded-xl text-slate-600 hover:text-indigo-700 hover:bg-indigo-100/50 font-semibold">
                    <Eye className="w-4 h-4 mr-2" /> Xem
                  </Button>
                </Link>
                <div className="w-px h-6 bg-slate-200 self-center"></div>
                <Button variant="ghost" className="flex-1 rounded-xl text-slate-600 hover:text-amber-700 hover:bg-amber-100/50 font-semibold">
                  <Edit className="w-4 h-4 mr-2" /> Sửa
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
