"use client";

import React from "react";
import { FileText, GitMerge, CheckCircle2, TrendingUp, Users, Target } from "lucide-react";
import { useMasterPlanContext } from "./MasterPlanContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterPlanForm } from "./MasterPlanForm";

export function MasterPlanDetail() {
  const { state, actions } = useMasterPlanContext();

  if (state.mode === "create") {
    return <MasterPlanForm />;
  }

  const selectedPlan = state.masterPlans.find(p => p.id === state.selectedId);

  if (!selectedPlan) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl m-4">
        <div className="bg-white p-5 rounded-full shadow-sm border border-slate-100 mb-4">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Chưa chọn Kế hoạch</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
          Vui lòng chọn một kế hoạch từ danh sách bên trái hoặc tạo mới để xem chi tiết và phân rã chỉ tiêu.
        </p>
      </div>
    );
  }

  const progress = selectedPlan.totalTasks > 0 ? Math.round((selectedPlan.completedTasks / selectedPlan.totalTasks) * 100) : 0;

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-xl shadow-sm">
      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab} className="flex-1 flex flex-col min-h-0">

        {/* Header & Tabs */}
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-6 pb-0">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                  MÔ HÌNH {selectedPlan.type || 'BSC_KPI'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${selectedPlan.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                  {selectedPlan.status === 'ACTIVE' ? 'ĐANG THỰC THI' : 'BẢN NHÁP'}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedPlan.title}</h2>
            </div>
          </div>

          <TabsList className="h-10 w-full sm:w-auto bg-slate-200/50 p-1 rounded-t-lg rounded-b-none border-b-0 gap-1">
            <TabsTrigger value="info" className="gap-2 px-6 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700">
              <TrendingUp className="h-4 w-4 shrink-0" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 px-6 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700">
              <GitMerge className="h-4 w-4 shrink-0" />
              Chỉ tiêu & Nhiệm vụ
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: Info */}
        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  Tiến độ hoàn thành
                </h3>
                <span className="text-2xl font-black text-slate-900">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 text-right">{selectedPlan.completedTasks} / {selectedPlan.totalTasks} nhiệm vụ đã xong</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Phân bổ nhân sự
              </h3>
              <p className="text-3xl font-black text-slate-900">{selectedPlan.totalTasks}</p>
              <p className="text-xs text-slate-500">Mục tiêu cá nhân được giao</p>
            </div>
          </div>
        </TabsContent>

        {/* Tab Content: Tasks */}
        <TabsContent value="tasks" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Danh sách Nhiệm vụ / Chỉ tiêu</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Nội dung chỉ tiêu (Công việc)</th>
                  <th className="p-4">Ngạch áp dụng</th>
                  <th className="p-4 text-center">Định mức</th>
                  <th className="p-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedPlan.tasks && selectedPlan.tasks.length > 0 ? (
                  (() => {
                    const uniqueTasks = Array.from(new Set(selectedPlan.tasks.map((t: any) => t.title)))
                      .map(title => selectedPlan.tasks.find((t: any) => t.title === title));

                    return uniqueTasks.map((task: any, index: number) => {
                      // Extract info from description if available
                      const desc = task.description || '';
                      const perspectiveMatch = desc.match(/Góc độ: (.*?)\n/);
                      const unitMatch = desc.match(/Đơn vị tính: (.*?)\n/);
                      
                      const perspective = perspectiveMatch ? perspectiveMatch[1] : (task.perspective || '');
                      const unit = unitMatch ? unitMatch[1] : (task.metric || 'Lượt');
                      
                      const rankInfo = state.ranks.find(r => r.code === perspective);
                      
                      return (
                        <tr key={`${task.id}-${index}`} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <div className="font-medium text-slate-800 mb-1">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-slate-500 whitespace-pre-wrap mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md text-xs font-bold">
                              {rankInfo ? (rankInfo.nameVi || rankInfo.name) : (perspective || 'Tất cả')}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                              <span className="font-black text-slate-800">{task.baseScore || task.target || 0}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-500">{unit}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${task.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                              {task.status || 'TODO'}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Kế hoạch này chưa có nhiệm vụ nào được phân bổ.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
