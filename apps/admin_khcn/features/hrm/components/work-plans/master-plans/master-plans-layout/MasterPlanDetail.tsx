"use client";

import React, { useState, useCallback } from "react";
import { FileText, GitMerge, TrendingUp, LayoutList, Table2 } from "lucide-react";
import { useMasterPlanContext } from "./MasterPlanContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterPlanForm } from "./MasterPlanForm";
import { TaskAssignModal } from "../../tasks/assign/TaskAssignModal";
import { PlanTaskTree } from "../../tasks/tree/PlanTaskTree";
import { PlanExecutionMatrix } from "../../tasks/matrix/PlanExecutionMatrix";
import { SubTaskModal } from "../../tasks/subtask/SubTaskModal";
import { hrmTasksApi } from "@/features/hrm/api";
import { useQuery } from "@tanstack/react-query";
import { Target, AlertTriangle, Building2, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#94a3b8'];

export function MasterPlanDetail() {
  const { state, actions } = useMasterPlanContext();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);
  const [addRootTaskOpen, setAddRootTaskOpen] = useState(false);

  const selectedPlan = state.masterPlans.find(p => p.id === state.selectedId);

  // Kiểm tra quyền: Sử dụng allowedActions trả về từ backend
  const allowedActions = selectedPlan?.allowedActions || [];
  const canAddRootTask = allowedActions.includes('ADD_ROOT_TASK');

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

  const taskTree = planTasksRes?.data || [];
  const flattenTasks = (nodes: any[]): any[] => {
    let result: any[] = [];
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) {
        result = result.concat(flattenTasks(node.children));
      }
    }
    return result;
  };
  const allPlanTasks: any[] = flattenTasks(taskTree);

  // Tiến độ & Thống kê
  const doneTasks = allPlanTasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = allPlanTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasks = allPlanTasks.filter(t => t.status === 'TODO').length;
  const overdueTasks = allPlanTasks.filter(t => t.status === 'OVERDUE').length;
  const totalTasks = allPlanTasks.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Dữ liệu Biểu đồ Trạng thái (Pie Chart)
  const statusDistribution = [
    { name: 'Đã hoàn thành', value: doneTasks },
    { name: 'Đang xử lý', value: inProgressTasks },
    { name: 'Chưa bắt đầu', value: todoTasks },
    { name: 'Trễ hạn / Cảnh báo', value: overdueTasks },
  ].filter(s => s.value > 0);

  // Dữ liệu Top Cá nhân/Đơn vị
  const assigneesMap: Record<string, { total: number; done: number; name: string }> = {};
  allPlanTasks.forEach(t => {
    if (t.assigneeName && t.assigneeCode !== 'UNASSIGNED') {
      if (!assigneesMap[t.assigneeCode]) {
        assigneesMap[t.assigneeCode] = { total: 0, done: 0, name: t.assigneeName };
      }
      assigneesMap[t.assigneeCode].total++;
      if (t.status === 'DONE') assigneesMap[t.assigneeCode].done++;
    }
  });

  const topAssignees = Object.values(assigneesMap)
    .map(a => ({ name: a.name, score: Math.round((a.done / a.total) * 100) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

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
            <TabsTrigger value="execution" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 text-xs font-semibold">
              <LayoutList className="h-3.5 w-3.5 shrink-0" /> Cấu trúc & Giao việc
            </TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1.5 px-4 h-8 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 text-xs font-semibold">
              <Table2 className="h-3.5 w-3.5 shrink-0" /> Tổng hợp
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab: Tổng quan (Dashboard KPI tích hợp) ── */}
        <TabsContent value="info" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30 space-y-6">
          {/* Top Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Tiến độ Kế hoạch</p>
                    <p className="text-3xl font-bold text-slate-900">{progress}%</p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                  </div>
                </div>
                <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Tổng Nhiệm vụ (KPIs)</p>
                    <p className="text-3xl font-bold text-slate-900">{totalTasks}</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-500">
                  <span className="font-semibold text-emerald-600 mr-1">{doneTasks} đã xong</span> / <span className="ml-1">{inProgressTasks} đang xử lý</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Nhân sự tham gia</p>
                    <p className="text-3xl font-bold text-slate-700">{Object.keys(assigneesMap).length}</p>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-slate-400 font-medium">
                  Tham gia vào kế hoạch này
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 bg-rose-50/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Cảnh báo Trễ hạn</p>
                    <p className="text-3xl font-bold text-rose-600">{overdueTasks}</p>
                  </div>
                  <div className="p-2 bg-rose-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-rose-500">
                  Cần xử lý ngay
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-3 shadow-sm border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-indigo-500" /> Trạng thái Nhiệm vụ
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-4 pt-6">
                <div className="h-[200px] w-1/2">
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                  )}
                </div>
                <div className="space-y-3 text-sm w-1/2">
                  {statusDistribution.map((stat, i) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                        {stat.name}
                      </span>
                      <span className="font-bold text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 shadow-sm border-slate-200">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" /> Bảng xếp hạng Hiệu suất
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {topAssignees.length > 0 ? (
                  topAssignees.map((assignee: any) => (
                    <div key={assignee.name} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-700">{assignee.name}</span>
                        <span className="font-black text-slate-900">{assignee.score}%</span>
                      </div>
                      <Progress value={Math.min(assignee.score, 100)} className="h-2 bg-slate-100" />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8 text-sm">Chưa có người nhận việc nào hoàn thành nhiệm vụ.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Triển khai — Cây nhiệm vụ phân cấp ── */}
        <TabsContent value="execution" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <PlanTaskTree
            tasks={taskTree}
            planId={selectedPlan.id}
            canAddRoot={canAddRootTask}
            onAddRootTask={() => setAddRootTaskOpen(true)}
            onRefresh={handleRefresh}
            isLoading={planTasksLoading}
          />
        </TabsContent>

        {/* ── Tab: Tổng hợp — Bảng Excel-like ── */}
        <TabsContent value="matrix" className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none bg-slate-50/30">
          <PlanExecutionMatrix
            tasks={taskTree}
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
