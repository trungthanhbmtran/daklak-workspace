"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Target, Plus, CheckCircle2, Circle, Clock, Building2, Users, HeartHandshake, Lightbulb, PieChart, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { hrmPlansApi, hrmObjectivesApi, hrmDepartmentsApi } from "@/features/hrm/api";
import type { HrmMasterPlan, HrmPlanObjective, HrmPlanPerspective, HrmDepartment } from "@/features/hrm/types";
import { cn } from "@/lib/utils";
import { PlanTaskAssignDrawer } from "./PlanTaskAssignDrawer";
import { PlanAutoGeneratorModal } from "./PlanAutoGeneratorModal";
import { toast } from "sonner";

export const PlanDetailClient = ({ planId }: { planId: number }) => {
  const router = useRouter();
  const [plan, setPlan] = useState<HrmMasterPlan | null>(null);
  const [objectives, setObjectives] = useState<HrmPlanObjective[]>([]);
  const [departments, setDepartments] = useState<HrmDepartment[]>([]);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePerspectiveId, setActivePerspectiveId] = useState<string>("FINANCIAL");
  const [activePerspectiveTitle, setActivePerspectiveTitle] = useState<string>("Tài chính");

  const [addColOpen, setAddColOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [newColColor, setNewColColor] = useState("indigo");

  const [aiModalOpen, setAiModalOpen] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      hrmPlansApi.getOne(planId),
      hrmObjectivesApi.list(planId),
      hrmDepartmentsApi.list()
    ]).then(([planRes, objRes, deptRes]) => {
      setPlan(planRes);
      setObjectives(objRes.data);
      setDepartments(deptRes.data);
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

  const handleOpenDrawer = (perspectiveId: string, perspectiveTitle: string) => {
    setActivePerspectiveId(perspectiveId);
    setActivePerspectiveTitle(perspectiveTitle);
    setDrawerOpen(true);
  };

  const handleAddColumn = async () => {
    if (!newColTitle.trim() || !plan) return;
    const newCol: HrmPlanPerspective = {
      id: "custom_" + Date.now(),
      title: newColTitle.trim(),
      colorClass: newColColor
    };
    const updatedPerspectives = [...(plan.perspectives || []), newCol];
    
    // Update local state immediately for fast feedback
    setPlan({ ...plan, perspectives: updatedPerspectives });
    setAddColOpen(false);
    setNewColTitle("");
    
    // Update backend (mock)
    await hrmPlansApi.update(plan.id, { perspectives: updatedPerspectives });
    toast.success("Đã thêm nhóm mục tiêu mới");
  };

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-slate-500 font-bold">Đang tải cấu trúc BSC...</div>;
  }

  if (!plan) {
    return <div className="p-10 text-center text-red-500 font-bold">Không tìm thấy kế hoạch</div>;
  }

  // Calculate stats
  const totalWeight = (pId: string) => objectives.filter(o => o.perspective === pId).reduce((sum, o) => sum + (o.weight || 0), 0);

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
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setAiModalOpen(true)}
            className="rounded-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-200 hover:opacity-90 border-0 flex items-center gap-2 h-11 px-5"
          >
            <Lightbulb className="w-5 h-5 text-yellow-200" />
            <span className="hidden sm:inline">AI Lập Kế Hoạch</span>
          </Button>
        </div>
      </div>

      {/* BSC Grid - Horizontal Scroll for Kanban style */}
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
        {plan.perspectives?.map(p => {
          const pObjs = objectives.filter(o => o.perspective === p.id);
          const currentWeight = totalWeight(p.id);
          const isOverWeight = currentWeight > 100;
          
          const colorClass = p.colorClass || "indigo";
          const colorText = `text-${colorClass}-600`;
          const colorBg = `bg-${colorClass}-50`;
          const colorBorder = `border-${colorClass}-200`;

          return (
            <div key={p.id} className="flex flex-col gap-4 w-full min-w-[320px] max-w-[350px] shrink-0 snap-start">
              {/* Perspective Header */}
              <div className={cn("p-5 rounded-2xl border-t-4 shadow-sm relative overflow-hidden", colorBg, colorBorder)}>
                <div className="absolute -right-4 -top-4 opacity-10">
                  <Target className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn("p-2 rounded-xl bg-white shadow-sm", colorText)}>
                    <Target className="w-5 h-5" />
                  </div>
                  <h3 className={cn("font-bold text-lg", colorText)}>{p.title}</h3>
                </div>
                <div className="flex justify-between items-end mt-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Trọng số: <span className={cn("text-sm", isOverWeight ? "text-red-500" : "text-slate-700")}>{currentWeight}%</span> / 100%
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenDrawer(p.id, p.title)}
                    className={cn("rounded-lg font-bold shadow-sm h-8", "bg-white border", colorBorder, colorText, "hover:bg-white/80")}
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

                        {obj.cases && obj.cases.length > 0 && (
                          <div className="mt-3 bg-indigo-50/50 rounded-xl border border-indigo-100 p-3">
                            <p className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 mb-2">
                              <ListChecks className="w-3.5 h-3.5" /> Chi tiết công việc ({obj.cases.filter(c => c.isDone).length}/{obj.cases.length})
                            </p>
                            <ul className="space-y-1.5">
                              {obj.cases.map((c, idx) => (
                                <li key={c.id} className="flex items-start gap-2 text-xs text-slate-600">
                                  <div className="mt-0.5">
                                    {c.isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 text-slate-300" />}
                                  </div>
                                  <span className={cn("flex-1", c.isDone && "line-through text-slate-400")}>{c.title}</span>
                                  {c.assigneeName && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-indigo-100 text-indigo-600 font-semibold whitespace-nowrap">
                                      {c.assigneeName}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            {obj.status === "DONE" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                              obj.status === "IN_PROGRESS" ? <Clock className="w-4 h-4 text-amber-500" /> :
                                <Circle className="w-4 h-4 text-slate-300" />}
                            {obj.weight}% KPI
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[120px]" title="Phòng ban phụ trách">
                            {obj.departmentIds && obj.departmentIds.length > 0 ? (
                              obj.departmentIds.map(dId => {
                                const dept = departments.find(d => d.id === dId);
                                return dept ? (
                                  <span key={dId} className="px-1.5 py-0.5 rounded-md bg-indigo-100/80 text-indigo-700 text-[10px] font-bold border border-indigo-200/50">
                                    {dept.code || dept.name}
                                  </span>
                                ) : null;
                              })
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] font-bold">?</span>
                            )}
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
        
        {/* Add Column Button */}
        <div className="flex flex-col gap-4 w-full min-w-[320px] max-w-[350px] shrink-0 snap-start">
          <Button 
            variant="outline" 
            onClick={() => setAddColOpen(true)}
            className="h-full min-h-[140px] border-2 border-dashed border-slate-300 bg-transparent hover:bg-slate-100 text-slate-500 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mb-1">
              <Plus className="w-5 h-5 text-slate-600" />
            </div>
            <span className="font-bold">Thêm nhóm mục tiêu</span>
          </Button>
        </div>
      </div>

      <PlanTaskAssignDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        planId={planId}
        perspectiveId={activePerspectiveId}
        perspectiveTitle={activePerspectiveTitle}
        onSuccess={() => {
          setDrawerOpen(false);
          loadData();
        }}
      />
      
      <PlanAutoGeneratorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        plan={plan}
        onSuccess={() => {
          setAiModalOpen(false);
          loadData();
        }}
      />
      
      {/* Dialog Thêm Cột */}
      <Dialog open={addColOpen} onOpenChange={setAddColOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800">Thêm nhóm mục tiêu mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="colTitle" className="font-bold text-slate-700">Tên nhóm / Cột</Label>
              <Input
                id="colTitle"
                placeholder="VD: Kinh doanh, Chăm sóc khách hàng..."
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-slate-700">Màu sắc chủ đạo</Label>
              <div className="flex items-center gap-3">
                {["indigo", "emerald", "blue", "amber", "rose", "purple", "cyan"].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      newColColor === color ? "border-slate-800 scale-110 shadow-sm" : "border-transparent hover:scale-105",
                      `bg-${color}-500`
                    )}
                    // Fallback using style for dynamic tailwind bg if not safelisted
                    style={{ backgroundColor: color === 'indigo' ? '#6366f1' : color === 'emerald' ? '#10b981' : color === 'blue' ? '#3b82f6' : color === 'amber' ? '#f59e0b' : color === 'rose' ? '#f43f5e' : color === 'purple' ? '#a855f7' : '#06b6d4' }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddColOpen(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button onClick={handleAddColumn} className="rounded-xl font-bold bg-slate-900 text-white">Thêm nhóm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
