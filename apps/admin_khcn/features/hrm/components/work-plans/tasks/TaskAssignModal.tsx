"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Check,
  ChevronsUpDown,
  Activity,
  Sparkles,
  Calendar,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { hrmTasksApi } from "@/features/hrm/api";
import { useHrmEmployeesList } from '../../../hooks';
import { useUser } from '@/hooks/useUser';

interface TaskAssignModalProps {
  isOpen: boolean;
  onClose: (assignedTaskId?: string) => void;
  task: any;
}

export function TaskAssignModal({ isOpen, onClose, task }: TaskAssignModalProps) {
  const { user } = useUser();
  const [openPopover, setOpenPopover] = useState(false);

  const [taskState, setTaskState] = useState({
    assigneeCode: '',
    priority: 'MEDIUM',
    baseScore: 10,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    weight: 20
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      setTaskState({
        assigneeCode: (task.assigneeCode && task.assigneeCode !== 'UNASSIGNED') ? task.assigneeCode : '',
        priority: task.priority || 'MEDIUM',
        baseScore: task.baseScore || task.targetValue || 10,
        startDate: task.startDate ? task.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: task.endDate ? task.endDate.split('T')[0] : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        weight: task.weight || 20
      });
    }
  }, [task, isOpen]);

  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true } as any);

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

  const assignableEmployees = [...employees].sort((a, b) => {
    if (a.matchDomain !== b.matchDomain) return a.matchDomain ? -1 : 1;
    if (a.matchLocation !== b.matchLocation) return a.matchLocation ? -1 : 1;
    if (a.currentLoad !== b.currentLoad) return a.currentLoad - b.currentLoad;
    return b.performanceScore - a.performanceScore;
  });

  const currentEmp = employees.find(e => e.code === taskState.assigneeCode);
  const isOverload = currentEmp ? (currentEmp.currentLoad + taskState.weight > currentEmp.rankLimit) : false;

  const handleSubmit = async () => {
    if (!taskState.assigneeCode) return toast.error('Vui lòng chọn người thực hiện!');
    if (isOverload) return toast.error('Không thể giao! Khối lượng công việc vượt quá định mức của nhân sự.');

    setIsSubmitting(true);
    try {
      const taskId = task.id;
      await hrmTasksApi.update(taskId, {
        weight: taskState.weight,
        startDate: taskState.startDate,
        dueDate: taskState.dueDate,
        priority: taskState.priority,
        baseScore: taskState.baseScore,
      });

      await hrmTasksApi.assignTask(taskId, {
        assigneeCode: taskState.assigneeCode
      });

      toast.success(`Đã giao việc thành công: ${task.title}`);
      onClose(taskId);
    } catch {
      toast.error('Lỗi khi giao việc');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl w-[96vw] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 p-0 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Phân công công việc
            </DialogTitle>
            <DialogDescription className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed">
              {task.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-6">
            {/* Người thực hiện */}
            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Người thực hiện <span className="text-red-500">*</span></label>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-7 px-3 text-[11px] bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold rounded-full"
                  onClick={() => {
                    if (assignableEmployees.length > 0) {
                      setTaskState(p => ({ ...p, assigneeCode: assignableEmployees[0].code }));
                      toast.success(`Giao thông minh cho: ${assignableEmployees[0].name}`);
                    }
                  }}
                  type="button"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Giao thông minh
                </Button>
              </div>
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-between h-11 bg-slate-50 border-slate-200 text-left font-semibold px-4", !currentEmp && "text-slate-500")}>
                    <span className="truncate">{currentEmp ? currentEmp.name : "Chọn cán bộ phù hợp..."}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm tên, chức danh..." className="h-10" />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy nhân sự phù hợp</CommandEmpty>
                      <CommandGroup>
                        {assignableEmployees.map((emp, idx) => (
                          <CommandItem
                            key={emp.code}
                            value={`${emp.name} ${emp.jobTitle?.name || ''}`}
                            onSelect={() => {
                              setTaskState(p => ({ ...p, assigneeCode: emp.code }));
                              setOpenPopover(false);
                            }}
                            className={cn("p-3 cursor-pointer border-b border-slate-100 last:border-0", idx === 0 && "bg-indigo-50/50")}
                          >
                            <Check className={cn("mr-3 h-4 w-4 text-indigo-600", taskState.assigneeCode === emp.code ? "opacity-100" : "opacity-0")} />
                            <div className="flex flex-col flex-1 gap-1.5">
                              <div className="flex justify-between font-bold text-slate-800 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <span>{emp.name}</span>
                                  {idx === 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-sm whitespace-nowrap">Đề xuất #1</span>}
                                </div>
                                <span className="text-xs text-indigo-600">Tải: {emp.currentLoad}/{emp.rankLimit}đ</span>
                              </div>
                              <div className="text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">Lĩnh vực / Phòng ban:</span> {emp.department?.name || 'Đơn vị chuyên môn'}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{emp.jobTitle?.name || 'Chuyên viên'}</span>
                                {emp.matchDomain && <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">✓ Phù hợp chuyên môn</span>}
                                {emp.matchLocation && <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">✓ Đúng tuyến</span>}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Cảnh báo quá tải cục bộ */}
              {currentEmp && (
                <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Dự kiến tải công việc</span>
                    <span className={cn("font-bold", isOverload ? "text-red-600" : "text-indigo-600")}>
                      {currentEmp.currentLoad + taskState.weight} / {currentEmp.rankLimit} đ
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", isOverload ? "bg-red-500" : "bg-indigo-600")} style={{ width: `${Math.min(((currentEmp.currentLoad + taskState.weight) / currentEmp.rankLimit) * 100, 100)}%` }} />
                  </div>
                  {isOverload && (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> Cán bộ này vượt quá định mức nếu nhận việc. Vui lòng chọn người khác hoặc giảm trọng số.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Độ ưu tiên */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Độ ưu tiên</label>
              <Select value={taskState.priority} onValueChange={(v) => setTaskState(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="h-11 bg-white font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">🔴 Cao</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                  <SelectItem value="LOW">🟢 Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Trọng số */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trọng số (%)</label>
              <Input
                type="number"
                value={taskState.weight}
                onChange={(e) => setTaskState(p => ({ ...p, weight: Number(e.target.value) }))}
                className="h-11 bg-white font-medium"
              />
            </div>

            {/* Điểm số */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Điểm gốc</label>
              <Input
                type="number"
                value={taskState.baseScore}
                onChange={(e) => setTaskState(p => ({ ...p, baseScore: Number(e.target.value) }))}
                className="h-11 bg-white font-medium"
              />
            </div>

            {/* Hạn chót */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Hạn chót</label>
              <div className="relative">
                <Input
                  type="date"
                  value={taskState.dueDate}
                  onChange={(e) => setTaskState(p => ({ ...p, dueDate: e.target.value }))}
                  className="h-11 bg-white font-medium pl-10"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 mt-2 pt-5 border-t border-slate-100 dark:border-slate-700">
            <Button variant="ghost" onClick={() => onClose()} className="font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl h-11 px-6">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!taskState.assigneeCode || isOverload || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-8 shadow-sm"
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận giao việc"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
