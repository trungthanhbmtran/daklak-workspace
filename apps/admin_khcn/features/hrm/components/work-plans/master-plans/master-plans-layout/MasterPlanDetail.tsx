"use client";

import React, { useState, useCallback } from "react";
import { FileText, GitMerge, TrendingUp, LayoutList, Table2 } from "lucide-react";
import { useMasterPlanContext } from "./MasterPlanContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterPlanForm } from "./MasterPlanForm";
import { Button } from "@/components/ui/button";
import { TaskAssignModal } from "../../tasks/TaskAssignModal";
import { PlanTaskTree } from "../../tasks/PlanTaskTree";
import { PlanExecutionMatrix } from "../../tasks/PlanExecutionMatrix";
import { SubTaskModal } from "../../tasks/SubTaskModal";
import { useUser } from "@/hooks/useUser";
import { hrmTasksApi } from "@/features/hrm/api";
import { useQuery } from "@tanstack/react-query";

export function MasterPlanDetail() {
  const { state, actions } = useMasterPlanContext();
  const { user } = useUser();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [addRootTaskOpen, setAddRootTaskOpen] = useState(false);

  const selectedPlan = state.masterPlans.find(p => p.id === state.selectedId);
  const currentUserCode = user?.employeeCode || user?.username || '';
  const currentUserUnit = user?.unitId ? parseInt(user.unitId, 10) : undefined;

  // Load tất cả task của plan (flat list) — bao gồm mọi cấp sub-task
  const {
    data: planTasksRes,
    isLoading: planTasksLoading,
    refetch: refetchPlanTasks,
  } = useQuery({
    queryKey: ['plan-tasks', selectedPlan?.id],
    queryFn: () => hrmTasksApi.listByPlan(selectedPlan!.id),
    enabled: !!selectedPlan?.id,
  });

  const handleRefresh = useCallback(() => {
    refetchPlanTasks();
    actions.refreshPlans();
  }, [refetchPlanTasks, actions]);

  if (state.mode === "create") {
    return <MasterPlanForm />;
  }

  if (!selectedPlan) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl m-4">
        <div className="bg-white p-5 rounded-full shadow-sm border border-slate-100 mb-4">
          <FileText className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700">Chưa chọn Kế hoạch</h3>
        <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
          Vui lòng chọn một kế hoạch từ danh sách bên trái hoặc tạo mới để xem chi tiết.
        </p>
      </div>
    );
  }

  const allPlanTasks: any[] = planTasksRes?.data || [];

  // Tiến độ
  const doneTasks = allPlanTasks.filter(t => t.status === 'DONE').length;
  const totalTasks = allPlanTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden bg-white border border-slate-200/60 rounded-xl shadow-sm">
      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab} className="flex-1 flex flex-col min-h-0">

        {/* Header & Tabs */}
        <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 p-6 pb-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider">
                  {selectedPlan.type || 'KẾ HOẠCH'}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${selectedPlan.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                  {selectedPlan.status === 'ACTIVE' ? 'ĐANG THỰC THI' : 'BẢN NHÁP'}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedPlan.title}</h2>
            </div>

            {/* Progress mini */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">{progress}%</p>
                <p className="text-xs text-slate-500">{doneTasks}/{totalTasks} hoàn thành</p>
              </div>
              <div className="w-1.5 h-12 bg-slate-100 rounded-full overflow-hidden flex flex-col-reverse">
                <div
                  className="w-full bg-emerald-500 rounded-full transition-all"
                  style={{ height: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <TabsList className="h-10 w-full sm:w-auto bg-slate-200/50 p-1 rounded-t-lg rounded-b-none border-b-0 gap-1">
            <TabsTrigger value="info" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" /> Tổng quan
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700 text-xs font-semibold">
              <GitMerge className="h-3.5 w-3.5 shrink-0" /> Chỉ tiêu
            </TabsTrigger>
            <TabsTrigger value="execution" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 text-xs font-semibold">
              <LayoutList className="h-3.5 w-3.5 shrink-0" /> Triển khai
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 text-xs font-semibold">
              <Table2 className="h-3.5 w-3.5 shrink-0" /> Tổng hợp
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab: Tổng quan ── */}
        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Thông tin kế hoạch</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Loại:</span>
                  <span className="font-semibold">{selectedPlan.type || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Từ:</span>
                  <span className="font-semibold">
                    {selectedPlan.startDate ? new Date(selectedPlan.startDate).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đến:</span>
                  <span className="font-semibold">
                    {selectedPlan.endDate ? new Date(selectedPlan.endDate).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Tiến độ hoàn thành</h3>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-slate-500">{doneTasks} / {totalTasks} nhiệm vụ đã xong</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-2">
              <h3 className="text-sm font-bold text-slate-700">Phân bổ nhiệm vụ</h3>
              <p className="text-3xl font-black text-slate-900">{totalTasks}</p>
              <p className="text-xs text-slate-500">Tổng nhiệm vụ (mọi cấp)</p>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Chỉ tiêu (legacy) ── */}
        <TabsContent value="tasks" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Danh sách Nhiệm vụ gốc</h3>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-3 text-xs rounded-full"
                onClick={() => {
                  setTaskToAssign(null);
                  setAssignModalOpen(true);
                }}
              >
                + Giao việc nhanh
              </Button>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase">
                <tr>
                  <th className="p-4">Nội dung</th>
                  <th className="p-4">Người thực hiện</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPlanTasks.filter(t => !t.parentId).length > 0 ? (
                  allPlanTasks.filter(t => !t.parentId).map((task: any) => (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{task.title}</td>
                      <td className="p-4 text-sm text-slate-600">
                        {task.assigneeName || task.assigneeCode || '—'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">{task.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-full text-xs"
                          onClick={() => { setTaskToAssign(task); setAssignModalOpen(true); }}
                        >
                          {task.assigneeCode === 'UNASSIGNED' ? 'Giao việc' : 'Chuyển giao'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Chưa có nhiệm vụ nào. Chuyển sang tab <strong>Triển khai</strong> để thêm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Tab: Triển khai — Cây nhiệm vụ phân cấp ── */}
        <TabsContent value="execution" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <PlanTaskTree
            tasks={allPlanTasks}
            currentUserCode={currentUserCode}
            planId={selectedPlan.id}
            planCreatorUnit={selectedPlan.departmentId}
            currentUserUnit={currentUserUnit}
            onAddRootTask={() => setAddRootTaskOpen(true)}
            onRefresh={handleRefresh}
            isLoading={planTasksLoading}
          />
        </TabsContent>

        {/* ── Tab: Tổng hợp — Bảng Excel-like ── */}
        <TabsContent value="matrix" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <PlanExecutionMatrix
            tasks={allPlanTasks}
            planTitle={selectedPlan.title}
            isLoading={planTasksLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Modal giao việc */}
      <TaskAssignModal
        isOpen={assignModalOpen}
        task={taskToAssign}
        onClose={(assignedTaskId) => {
          setAssignModalOpen(false);
          if (assignedTaskId) handleRefresh();
        }}
      />

      {/* Modal thêm đầu việc gốc */}
      <SubTaskModal
        isOpen={addRootTaskOpen}
        onClose={(created) => {
          setAddRootTaskOpen(false);
          if (created) handleRefresh();
        }}
        parentTask={{ id: null, title: selectedPlan.title, planId: selectedPlan.id }}
        planId={selectedPlan.id}
      />
    </div>
  );
}
