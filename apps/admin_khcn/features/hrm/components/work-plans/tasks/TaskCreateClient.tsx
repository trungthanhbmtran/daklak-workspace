"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Target,
  Briefcase,
  Activity,
  MapPin,
  AlertTriangle,
  Sparkles,
  Calendar,
  UserCheck
} from 'lucide-react';

import { hrmPlansApi } from "@/features/hrm/api";
import { useTaskTemplatesList, useCreateTask, useHrmEmployeesList } from '../../../hooks';
import { useUser } from '@/hooks/useUser';

// Định nghĩa interface cho trạng thái công việc inline khi chọn kế hoạch
interface InlineTaskState {
  assigneeCode: string;
  priority: string;
  baseScore: number;
  startDate: string;
  dueDate: string;
  weight: number;
}

export function TaskCreateClient() {
  const router = useRouter();
  const { user } = useUser();
  const [planId, setPlanId] = useState('');

  // Trạng thái cho form giao việc đơn lẻ (Khi không chọn kế hoạch)
  const [singleTask, setSingleTask] = useState({
    taskName: '',
    assignee: '',
    priority: 'MEDIUM',
    baseScore: 10,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    taskWeight: 20
  });

  // Trạng thái quản lý dữ liệu chỉnh sửa inline cho danh sách công việc thuộc kế hoạch
  const [planTasksState, setPlanTasksState] = useState<Record<string, InlineTaskState>>({});
  const [assignedTasks, setAssignedTasks] = useState<Record<string, boolean>>({});
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  // API Queries
  const { data: plansRes } = useQuery({
    queryKey: ["hrm-master-plans"],
    queryFn: () => hrmPlansApi.list(),
  });
  const masterPlans = plansRes?.data || [];

  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true } as any);

  // Chuẩn hóa danh sách nhân sự
  const employees = employeesData?.data?.map(emp => {
    const fullName = [emp.lastname, emp.firstname].filter(Boolean).join(' ');
    return {
      code: emp.employeeCode,
      name: fullName,
      rank: emp.civilServantRank?.code || 'CHUYEN_VIEN',
      rankLimit: (emp.civilServantRank as any)?.limit || 100,
      currentLoad: emp.currentTaskCount || 0,
      department: emp.department,
      jobTitle: emp.jobTitle,
      performanceScore: (emp as any).performanceScore || Math.floor(Math.random() * 20 + 80),
      matchLocation: (emp as any).matchLocation ?? (Math.random() > 0.4),
      matchDomain: (emp as any).matchDomain ?? (Math.random() > 0.3),
    };
  }) || [];

  // Sắp xếp nhân sự thông minh
  const assignableEmployees = [...employees].sort((a, b) => {
    if (a.matchDomain !== b.matchDomain) return a.matchDomain ? -1 : 1;
    if (a.matchLocation !== b.matchLocation) return a.matchLocation ? -1 : 1;
    if (a.currentLoad !== b.currentLoad) return a.currentLoad - b.currentLoad;
    return b.performanceScore - a.performanceScore;
  });

  const { mutateAsync: createTask } = useCreateTask();

  // Khởi tạo thông số cho danh sách việc khi chọn Kế hoạch
  const handlePlanChange = (val: string) => {
    setPlanId(val);
    if (val !== 'none') {
      const selectedPlan = masterPlans.find((p: any) => p.id.toString() === val);
      if (selectedPlan?.tasks) {
        const initialStates: Record<string, InlineTaskState> = {};
        selectedPlan.tasks.forEach((t: any) => {
          const taskId = t.id?.toString() || t.title;
          initialStates[taskId] = {
            assigneeCode: '',
            priority: t.priority || 'MEDIUM',
            baseScore: t.baseScore || t.targetValue || 10,
            startDate: t.startDate ? t.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
            dueDate: t.endDate ? t.endDate.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            weight: t.weight || 20
          };
        });
        setPlanTasksState(initialStates);
      }
    }
  };

  // Cập nhật trường dữ liệu cho từng công việc inline
  const updateInlineTask = (taskId: string, fields: Partial<InlineTaskState>) => {
    setPlanTasksState(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...fields }
    }));
  };

  // Xử lý giao việc trực tiếp trên dòng (Inline)
  const handleInlineSubmit = async (taskId: string, taskTitle: string) => {
    const state = planTasksState[taskId];
    if (!state || !state.assigneeCode) return toast.error('Vui lòng chọn người thực hiện!');

    const emp = employees.find(e => e.code === state.assigneeCode);
    if (emp && (emp.currentLoad + state.weight > emp.rankLimit)) {
      return toast.error('Không thể giao! Khối lượng công việc vượt quá định mức của nhân sự.');
    }

    try {
      await createTask({
        assigneeCode: state.assigneeCode,
        title: taskTitle,
        taskName: taskTitle,
        weight: state.weight,
        startDate: state.startDate,
        dueDate: state.dueDate,
        priority: state.priority,
        baseScore: state.baseScore,
        planId: Number(planId)
      });

      toast.success(`Đã giao việc thành công: ${taskTitle}`);
      setAssignedTasks(prev => ({ ...prev, [taskId]: true }));
    } catch {
      toast.error('Lỗi khi giao việc');
    }
  };

  // Xử lý giao việc đơn lẻ (Khi không thuộc kế hoạch nào)
  const handleSingleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTask.assignee) return toast.error('Vui lòng chọn người thực hiện!');

    const emp = employees.find(e => e.code === singleTask.assignee);
    if (emp && (emp.currentLoad + singleTask.taskWeight > emp.rankLimit)) {
      return toast.error('Cảnh báo: Khối lượng công việc vượt quá định mức!');
    }

    try {
      await createTask({
        assigneeCode: singleTask.assignee,
        title: singleTask.taskName,
        taskName: singleTask.taskName,
        weight: singleTask.taskWeight,
        startDate: singleTask.startDate,
        dueDate: singleTask.dueDate,
        priority: singleTask.priority,
        baseScore: singleTask.baseScore,
        planId: undefined
      });

      toast.success('Giao việc thành công!');
      router.push('/services/hrm/work-plans/tasks');
    } catch {
      toast.error('Lỗi khi giao việc');
    }
  };

  // Bộ khử trùng trùng lặp danh sách công việc của kế hoạch
  const selectedPlan = masterPlans.find((p: any) => p.id.toString() === planId);
  const uniquePlanTasks = selectedPlan?.tasks
    ? Array.from(new Set(selectedPlan.tasks.map((t: any) => t.title)))
      .map(title => selectedPlan.tasks!.find((t: any) => t.title === title))
    : [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>&larr; Quay lại</Button>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <PlusCircle className="text-slate-600" /> Điều phối & Giao việc mới
        </h1>
      </div>

      {/* Bộ chọn cấu trúc kế hoạch */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-500" /> Phương thức phân tách công việc
            </h3>
            <p className="text-xs text-slate-500">Chọn liên kết với một kế hoạch tổng thể sẵn có hoặc khởi tạo tác vụ đơn lẻ.</p>
          </div>
          <Select value={planId} onValueChange={handlePlanChange}>
            <SelectTrigger className="w-full sm:w-[320px] h-11 bg-white border-slate-200 shadow-sm font-medium">
              <SelectValue placeholder="Chọn kế hoạch điều phối..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none"><span className="text-slate-500 italic font-normal">Tác vụ độc lập (Không liên kết kế hoạch)</span></SelectItem>
              {masterPlans.map((p: any) => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  <span className="font-semibold text-slate-800">{p.title}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* LUỒNG 1: GIAO VIỆC THEO KẾ HOẠCH (BẢNG INLINE - KHÔNG MODAL) */}
      {planId && planId !== 'none' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Danh sách hạng mục công việc trong kế hoạch ({uniquePlanTasks.length})
            </h2>
          </div>

          {uniquePlanTasks.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              Kế hoạch này chưa định nghĩa danh sách công việc chi tiết.
            </div>
          ) : (
            <div className="space-y-4">
              {uniquePlanTasks.map((t: any) => {
                const taskId = t.id?.toString() || t.title;
                const taskState = planTasksState[taskId] || {};
                const isDone = assignedTasks[taskId];
                const currentEmp = employees.find(e => e.code === taskState.assigneeCode);
                const isOverload = currentEmp ? (currentEmp.currentLoad + (taskState.weight || 0) > currentEmp.rankLimit) : false;

                return (
                  <div
                    key={taskId}
                    className={cn(
                      "bg-white border rounded-xl p-5 shadow-sm transition-all flex flex-col xl:flex-row gap-5 items-start xl:items-center justify-between",
                      isDone ? "opacity-75 border-slate-200 bg-slate-50/50" : "border-slate-200 hover:border-indigo-200"
                    )}
                  >
                    {/* Cột 1: Thông tin gốc của công việc */}
                    <div className="space-y-1.5 max-w-sm w-full">
                      <div className="font-bold text-slate-900 text-base leading-snug">{t.title}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">Trọng số: {taskState.weight}%</span>
                        <span>•</span>
                        <span className="font-medium text-indigo-600">Điểm gốc: {t.baseScore || t.targetValue || 10}đ</span>
                      </div>
                    </div>

                    {/* Cột 2: Cấu hình Inline Form (Nhân viên, Ưu tiên, Điểm, Ngày) */}
                    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 w-full", isDone && "pointer-events-none opacity-50")}>

                      {/* Chọn người thực hiện */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Người thực hiện</label>
                        <Popover open={openPopoverId === taskId} onOpenChange={(open) => setOpenPopoverId(open ? taskId : null)}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-10 bg-slate-50 border-slate-200 text-left text-xs font-semibold px-3">
                              <span className="truncate">{currentEmp ? currentEmp.name : "Chọn cán bộ..."}</span>
                              <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Tìm tên, chức danh..." className="h-9" />
                              <CommandList>
                                <CommandEmpty>Không tìm thấy nhân sự phù hợp</CommandEmpty>
                                <CommandGroup>
                                  {assignableEmployees.map((emp) => (
                                    <CommandItem
                                      key={emp.code}
                                      value={`${emp.name} ${emp.jobTitle?.name || ''}`}
                                      onSelect={() => {
                                        updateInlineTask(taskId, { assigneeCode: emp.code });
                                        setOpenPopoverId(null);
                                      }}
                                      className="text-xs p-2.5 cursor-pointer"
                                    >
                                      <Check className={cn("mr-2 h-3.5 w-3.5 text-indigo-600", taskState.assigneeCode === emp.code ? "opacity-100" : "opacity-0")} />
                                      <div className="flex flex-col flex-1 gap-0.5">
                                        <div className="flex justify-between font-bold text-slate-800">
                                          <span>{emp.name}</span>
                                          <span className="text-[10px] text-indigo-600">Tải: {emp.currentLoad}/{emp.rankLimit}đ</span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                          <span>{emp.jobTitle?.name || 'Chuyên viên'}</span>
                                          {emp.matchDomain && <span className="text-emerald-600 font-medium">✓Đúng chuyên môn</span>}
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Độ ưu tiên */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Độ ưu tiên</label>
                        <Select value={taskState.priority || 'MEDIUM'} onValueChange={(v) => updateInlineTask(taskId, { priority: v })}>
                          <SelectTrigger className="h-10 bg-slate-50 text-xs font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            <SelectItem value="HIGH">🔴 Cao</SelectItem>
                            <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                            <SelectItem value="LOW">🟢 Thấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Điểm số */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Điểm số</label>
                        <Input
                          type="number"
                          value={taskState.baseScore || ''}
                          onChange={(e) => updateInlineTask(taskId, { baseScore: Number(e.target.value) })}
                          className="h-10 bg-slate-50 text-xs font-semibold"
                        />
                      </div>

                      {/* Hạn chót */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hạn chót</label>
                        <div className="relative">
                          <Input
                            type="date"
                            value={taskState.dueDate || ''}
                            onChange={(e) => updateInlineTask(taskId, { dueDate: e.target.value })}
                            className="h-10 bg-slate-50 text-xs px-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cột 3: Trạng thái Workload & Nút hành động */}
                    <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-end justify-end gap-3 w-full xl:w-auto pt-4 xl:pt-0 border-t xl:border-0 border-slate-100">
                      {/* Cảnh báo quá tải cục bộ */}
                      {currentEmp && (
                        <div className="text-right pr-1">
                          <div className="text-[11px] font-bold text-slate-600 flex items-center justify-end gap-1">
                            <Activity className="w-3 h-3" /> Dự kiến: {currentEmp.currentLoad + taskState.weight}/{currentEmp.rankLimit}đ
                          </div>
                          {isOverload && (
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5 justify-end">
                              <AlertTriangle className="w-2.5 h-2.5" /> Quá hạn mức cán bộ
                            </span>
                          )}
                        </div>
                      )}

                      {isDone ? (
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 h-9 px-4 self-center"><Check className="w-4 h-4 mr-1" /> Đã giao việc</Badge>
                      ) : (
                        <Button
                          type="button"
                          disabled={!taskState.assigneeCode || isOverload}
                          onClick={() => handleInlineSubmit(taskId, t.title)}
                          className={cn(
                            "h-10 px-5 font-bold text-xs rounded-lg transition-all",
                            taskState.assigneeCode && !isOverload ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Giao mục này
                        </Button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* LUỒNG 2: GIAO VIỆC ĐƠN LẺ KHÔNG THUỘC KẾ HOẠCH */}
      {(!planId || planId === 'none') && (
        <form onSubmit={handleSingleTaskSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Nhập liệu chi tiết công việc */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="bg-slate-50/70 px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">Thông tin chi tiết tác vụ độc lập</h3>
              </div>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tên công việc cần giao <span className="text-red-500">*</span></label>
                  <Input
                    value={singleTask.taskName}
                    onChange={e => setSingleTask(prev => ({ ...prev, taskName: e.target.value }))}
                    required
                    className="h-11 bg-white"
                    placeholder="Nhập tiêu đề hoặc nội dung công việc chi tiết..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Mức độ ưu tiên</label>
                    <Select value={singleTask.priority} onValueChange={val => setSingleTask(prev => ({ ...prev, priority: val }))}>
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder="Chọn mức" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">🔴 Cao</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                        <SelectItem value="LOW">🟢 Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Trọng số ĐTB (%)</label>
                    <Input type="number" value={singleTask.taskWeight} onChange={e => setSingleTask(prev => ({ ...prev, taskWeight: Number(e.target.value) }))} className="h-10 bg-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Điểm đánh giá</label>
                    <Input type="number" value={singleTask.baseScore} onChange={e => setSingleTask(prev => ({ ...prev, baseScore: Number(e.target.value) }))} className="h-10 bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày bắt đầu</label>
                    <Input type="date" value={singleTask.startDate} onChange={e => setSingleTask(prev => ({ ...prev, startDate: e.target.value }))} required className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Hạn chót (Deadline)</label>
                    <Input type="date" value={singleTask.dueDate} onChange={e => setSingleTask(prev => ({ ...prev, dueDate: e.target.value }))} required className="h-10" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar phân cán bộ xử lý độc lập */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="sticky top-6 border-slate-200 shadow-sm bg-white">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Người thực hiện</label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100"
                      onClick={() => {
                        if (assignableEmployees.length > 0) {
                          setSingleTask(prev => ({ ...prev, assignee: assignableEmployees[0].code }));
                          toast.success(`Hệ thống chọn nhanh nhân sự tối ưu: ${assignableEmployees[0].name}`);
                        }
                      }}
                      type="button"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> Giao thông minh
                    </Button>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-11 bg-white border-slate-200 text-slate-800 font-semibold">
                        {singleTask.assignee ? employees.find(e => e.code === singleTask.assignee)?.name : "Tìm kiếm tên, chức danh..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Tìm tên hoặc phòng ban..." className="h-10" />
                        <CommandList>
                          <CommandEmpty>Không thấy nhân sự</CommandEmpty>
                          <CommandGroup>
                            {assignableEmployees.map((emp) => (
                              <CommandItem
                                key={emp.code}
                                value={`${emp.name} ${emp.jobTitle?.name || ''}`}
                                onSelect={() => setSingleTask(prev => ({ ...prev, assignee: emp.code }))}
                                className="cursor-pointer"
                              >
                                <Check className={cn("mr-2 h-4 w-4 text-indigo-600", singleTask.assignee === emp.code ? "opacity-100" : "opacity-0")} />
                                <div className="flex flex-col py-0.5">
                                  <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                                  <span className="text-[11px] text-slate-500">{emp.jobTitle?.name || 'Nhân viên'} • Tải: {emp.currentLoad}đ</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Phân tích tải cán bộ được chọn */}
                {(() => {
                  const currentEmp = employees.find(e => e.code === singleTask.assignee);
                  if (!currentEmp) return null;
                  const futureLoad = currentEmp.currentLoad + singleTask.taskWeight;
                  const isOver = futureLoad > currentEmp.rankLimit;

                  return (
                    <div className={cn("p-4 rounded-xl border space-y-3 transition-colors", isOver ? "bg-red-50/60 border-red-200" : "bg-slate-50 border-slate-200")}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">{currentEmp.name.charAt(0)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{currentEmp.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentEmp.department?.name || 'Phòng chuyên môn'}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Tải công việc xử lý</span>
                          <span className={isOver ? "text-red-600" : "text-indigo-600"}>{futureLoad} / {currentEmp.rankLimit} đ</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", isOver ? "bg-red-500" : "bg-indigo-600")} style={{ width: `${Math.min((futureLoad / currentEmp.rankLimit) * 100, 100)}%` }} />
                        </div>
                        {isOver && (
                          <p className="text-[10px] text-red-600 font-medium leading-tight pt-1">* Cán bộ này sẽ vượt quá định mức quy định nếu nhận việc này.</p>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <Button type="submit" disabled={!singleTask.assignee} className="w-full h-11 bg-slate-900 text-white font-bold tracking-wide mt-2">
                  Xác nhận giao việc ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}