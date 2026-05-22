"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Plus, CheckCircle2, Circle, Clock, Building2, Users, HeartHandshake, Lightbulb, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hrmPlansApi, hrmObjectivesApi } from "@/features/hrm/api";
import type { HrmMasterPlan, HrmPlanObjective, BscPerspective } from "@/features/hrm/types";
import { cn } from "@/lib/utils";
import { PlanTaskAssignDrawer } from "./PlanTaskAssignDrawer";
import { toast } from "sonner";

export const PlanDetailClient = ({ planId }: { planId: number }) => {
  const router = useRouter();
  const [plan, setPlan] = useState<HrmMasterPlan | null>(null);
  const [objectives, setObjectives] = useState<HrmPlanObjective[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePerspective, setActivePerspective] = useState<BscPerspective>("FINANCIAL");

  const loadData = () => {
    setLoading(true);
    Promise.all([
      hrmPlansApi.getOne(planId),
      hrmObjectivesApi.list(planId)
    ]).then(([planRes, objRes]) => {
      setPlan(planRes);
      setObjectives(objRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      toast.error("Không thể tải chi tiết Kế hoạch");
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [planId]);

  const handleOpenDrawer = (perspective: BscPerspective) => {
    setActivePerspective(perspective);
    setDrawerOpen(true);
  };

  const PERSPECTIVES: { id: BscPerspective; label: string; icon: any; color: string; bg: string; borderColor: string }[] = [
    { id: "FINANCIAL", label: "Tài chính", icon: Building2, color: "text-amber-600", bg: "bg-amber-50", borderColor: "border-amber-200" },
    { id: "CUSTOMER", label: "Khách hàng", icon: HeartHandshake, color: "text-rose-600", bg: "bg-rose-50", borderColor: "border-rose-200" },
    { id: "INTERNAL_PROCESS", label: "Quy trình nội bộ", icon: Target, color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-200" },
    { id: "LEARNING_GROWTH", label: "Học hỏi & Phát triển", icon: Lightbulb, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-200" }
  ];

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-slate-500 font-bold">Đang tải cấu trúc BSC...</div>;
  }

  if (!plan) {
    return <div className="p-10 text-center text-red-500 font-bold">Không tìm thấy kế hoạch</div>;
  }

  // Calculate stats
  const totalWeight = (pId: BscPerspective) => objectives.filter(o => o.perspective === pId).reduce((sum, o) => sum + (o.weight || 0), 0);
  
  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/services/hrm/plans")} className="rounded-full shadow-sm bg-white">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md uppercase">
                Strategy Dashboard
              </span>
              <span className={cn("px-2.5 py-1 text-xs font-bold rounded-md uppercase", 
                plan.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
              )}>
                {plan.status}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <PieChart className="text-indigo-500 w-6 h-6" /> {plan.title}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{plan.description || "Quản trị hiệu suất theo chuẩn Balanced Scorecard & KPI+"}</p>
          </div>
        </div>
      </div>

      {/* BSC Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {PERSPECTIVES.map(p => {
          const pObjs = objectives.filter(o => o.perspective === p.id);
          const currentWeight = totalWeight(p.id);
          const isOverWeight = currentWeight > 100;

          return (
            <div key={p.id} className="flex flex-col gap-4">
              {/* Perspective Header */}
              <div className={cn("p-5 rounded-2xl border-t-4 shadow-sm relative overflow-hidden", p.bg, p.borderColor)}>
                <div className="absolute -right-4 -top-4 opacity-10">
                  <p.icon className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-xl bg-white shadow-sm", p.color)}>
                    <p.icon className="w-5 h-5" />
                  </div>
                  <h3 className={cn("font-bold text-lg", p.color)}>{p.label}</h3>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Trọng số: <span className={cn("text-sm", isOverWeight ? "text-red-500" : "text-slate-700")}>{currentWeight}%</span> / 100%
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenDrawer(p.id)}
                    className={cn("rounded-lg font-bold shadow-sm h-8", "bg-white border", p.borderColor, p.color, "hover:bg-white/80")}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Giao việc
                  </Button>
                </div>
              </div>

              {/* Objectives List */}
              <div className="flex-1 space-y-3">
                {pObjs.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center text-slate-400 bg-slate-50/50">
                    <Target className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-semibold">Chưa có Mục tiêu/KPI</p>
                  </div>
                ) : (
                  pObjs.map(obj => (
                    <Card key={obj.id} className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                      <div className={cn("absolute top-0 left-0 w-1 h-full", 
                        obj.status === "DONE" ? "bg-emerald-500" : 
                        obj.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-slate-300"
                      )}></div>
                      <CardContent className="p-4 pl-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                            {obj.title}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 my-3">
                          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Metric</p>
                            <p className="text-xs font-semibold text-slate-700 truncate" title={obj.metric}>{obj.metric || "--"}</p>
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                            <p className="text-[10px] text-emerald-600 uppercase font-bold">Target</p>
                            <p className="text-xs font-bold text-emerald-700">{obj.target || "--"}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            {obj.status === "DONE" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                             obj.status === "IN_PROGRESS" ? <Clock className="w-4 h-4 text-amber-500" /> :
                             <Circle className="w-4 h-4 text-slate-300" />}
                            {obj.weight}% KPI
                          </div>
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold" title="Người phụ trách">
                            {obj.assigneeId ? "ID" + obj.assigneeId : "?"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <PlanTaskAssignDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        planId={planId}
        perspective={activePerspective}
        onSuccess={() => {
          setDrawerOpen(false);
          loadData();
        }}
      />
    </div>
  );
};
