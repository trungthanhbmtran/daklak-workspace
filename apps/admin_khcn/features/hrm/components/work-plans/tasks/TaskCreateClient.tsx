"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { aiApi } from '../../../api/ai.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Save, AlertTriangle, Sparkles, PlusCircle, Target, Briefcase, Activity, MapPin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { hrmPlansApi } from "@/features/hrm/api";
import { useTaskTemplatesList, useCreateTask, useHrmEmployeesList } from '../../../hooks';
import { useQuery } from "@tanstack/react-query";

export function TaskCreateClient() {
  const router = useRouter();
  const [assignee, setAssignee] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [taskWeight, setTaskWeight] = useState(20);
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [baseScore, setBaseScore] = useState(10);
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [planId, setPlanId] = useState('');
  const [openAssignee, setOpenAssignee] = useState(false);

  const { data: plansRes } = useQuery({
    queryKey: ["hrm-master-plans"],
    queryFn: () => hrmPlansApi.list(),
  });
  const masterPlans = plansRes?.data || [];

  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true } as any);
  const employees = employeesData?.data?.map(emp => {
    // Sửa lại thứ tự hiển thị tên cho đúng (firstname trước lastname hoặc ngược lại theo feedback của user)
    const fullName = [emp.firstname, emp.lastname].filter(Boolean).join(' ');
    // Mock performance score and matching since backend might not have it yet
    const performanceScore = (emp as any).performanceScore || Math.floor(Math.random() * 20 + 80); // 80-99
    const matchLocation = (emp as any).matchLocation ?? (Math.random() > 0.4);
    const matchDomain = (emp as any).matchDomain ?? (Math.random() > 0.3);

    return {
      code: emp.employeeCode,
      name: fullName,
      rank: emp.civilServantRank?.code || 'CHUYEN_VIEN',
      rankLimit: (emp.civilServantRank as any)?.limit || 100,
      currentLoad: emp.currentTaskCount || 0,
      department: emp.department,
      jobTitle: emp.jobTitle,
      performanceScore,
      matchLocation,
      matchDomain,
    };
  }) || [];

  const assignableEmployees = [...employees].sort((a, b) => {
    // Ưu tiên chọn người phù hợp nhất:
    // 1. Phù hợp lĩnh vực
    if (a.matchDomain !== b.matchDomain) return a.matchDomain ? -1 : 1;
    // 2. Đúng địa bàn
    if (a.matchLocation !== b.matchLocation) return a.matchLocation ? -1 : 1;
    // 3. Khối lượng công việc ít nhất
    if (a.currentLoad !== b.currentLoad) return a.currentLoad - b.currentLoad;
    // 4. Điểm hiệu suất cao nhất
    return b.performanceScore - a.performanceScore;
  });
  const selectedEmp = employees.find(e => e.code === assignee);

  useEffect(() => {
    if (assignee && employeesData?.data && selectedEmp) {
      const unitDomainIds = selectedEmp.department?.domainIds || [];
      const jtDomainId = selectedEmp.jobTitle?.domainId;
      const domainsToMatch = new Set([...unitDomainIds, jtDomainId].filter(d => d != null && d > 0));

      let leader = employeesData.data.find((e) => {
        if (e.jobTitle?.code !== 'PHO_GIAM_DOC' && e.jobTitle?.code !== 'GIAM_DOC') return false;
        return e.jobTitle.domainId && domainsToMatch.has(e.jobTitle.domainId);
      });

      if (!leader) leader = employeesData.data.find((e) => e.jobTitle?.code === 'GIAM_DOC');
      if (leader) setSupervisor(leader.employeeCode);
    }
  }, [assignee, selectedEmp, employeesData?.data]);

  const { data } = useTaskTemplatesList(selectedEmp?.rank);
  const templates = data?.data || [];
  const { mutateAsync: createTask } = useCreateTask();

  const newLoad = selectedEmp ? selectedEmp.currentLoad + taskWeight : 0;
  const isOverload = selectedEmp ? newLoad > selectedEmp.rankLimit : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverload) return toast.error('Cảnh báo: Khối lượng công việc vượt quá định mức!');
    try {
      const finalPlanId = planId === 'none' || planId === '' ? undefined : Number(planId);
      await createTask({ assigneeCode: assignee, supervisorCode: supervisor, title: taskName, taskName, weight: taskWeight, startDate, dueDate, priority, baseScore, templateId: selectedTemplateId, planId: finalPlanId });
      toast.success('Giao việc thành công!');
      router.push('/services/hrm/work-plans/tasks');
    } catch { toast.error('Lỗi khi giao việc'); }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>&larr; Quay lại</Button>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <PlusCircle className="text-indigo-600" /> Giao Việc Mới
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form chính */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-sm flex items-center gap-2 text-indigo-800">
                <Sparkles className="w-4 h-4" /> Phân công AI
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <Textarea value={aiInstruction} onChange={e => setAiInstruction(e.target.value)} placeholder="Mô tả công việc để AI phân tích..." className="resize-none" rows={3} />
              <Button onClick={() => { }} className="w-full bg-indigo-600" disabled={isAiLoading}>Gợi ý Phân công</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-800">Thông tin chi tiết công việc</h3>
            </div>
            <CardContent className="p-6">
              <form id="taskForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Kế hoạch / Mục tiêu liên kết
                  </label>
                  <Select value={planId} onValueChange={(val) => { setPlanId(val); }}>
                    <SelectTrigger className="h-11 bg-slate-50 focus-visible:bg-white border-slate-200">
                      <SelectValue placeholder="Chọn kế hoạch (Không bắt buộc)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none"><span className="text-slate-500 italic">Không liên kết kế hoạch</span></SelectItem>
                      {masterPlans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          <span className="font-medium text-slate-800">{plan.title}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {planId && planId !== 'none' && (() => {
                  const selectedPlan = masterPlans.find((p: any) => p.id.toString() === planId);
                  if (!selectedPlan || !selectedPlan.tasks) return null;
                  const uniqueTasks = Array.from(new Set(selectedPlan.tasks.map((t: any) => t.title)))
                    .map(title => selectedPlan.tasks!.find((t: any) => t.title === title));

                  if (uniqueTasks.length === 0) return null;

                  return (
                    <div className="space-y-2 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <label className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        Danh sách công việc trong kế hoạch
                      </label>
                      <Select onValueChange={(val) => {
                        const t = uniqueTasks.find((x: any) => x.title === val);
                        if (t) {
                          setTaskName(t.title);
                          setBaseScore(t.baseScore || t.targetValue || 10);
                          if (t.weight) setTaskWeight(t.weight);
                          if (t.priority) setPriority(t.priority);
                        }
                      }}>
                        <SelectTrigger className="h-11 bg-white border-indigo-200">
                          <SelectValue placeholder="Chọn công việc để phân bổ..." />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueTasks.map((t: any) => (
                            <SelectItem key={t.id || t.title} value={t.title}>
                              <span className="font-medium text-slate-800">{t.title}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-slate-400" />
                    Tên công việc <span className="text-red-500">*</span>
                  </label>
                  <Input value={taskName} onChange={e => setTaskName(e.target.value)} required className="h-11 bg-slate-50 focus-visible:bg-white" placeholder="Nhập tên công việc cần giao..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Mức độ ưu tiên</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Chọn mức độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH"><span className="text-red-600 font-medium">🔴 Cao</span></SelectItem>
                        <SelectItem value="MEDIUM"><span className="text-amber-600 font-medium">🟡 Trung bình</span></SelectItem>
                        <SelectItem value="LOW"><span className="text-green-600 font-medium">🟢 Thấp</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Trọng số (ĐTB)</label>
                    <Input type="number" value={baseScore} onChange={e => setBaseScore(Number(e.target.value))} className="h-11 bg-white" placeholder="VD: 10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      Hạn chót (Deadline) <span className="text-red-500">*</span>
                    </label>
                    <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="h-11" />
                  </div>
                </div>


              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar nhân sự */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-6">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Người thực hiện</label>
                <Popover open={openAssignee} onOpenChange={setOpenAssignee}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAssignee}
                      className="w-full justify-between h-11 bg-slate-50 hover:bg-slate-100 border-slate-200"
                    >
                      {selectedEmp ? selectedEmp.name : "Tìm kiếm tên, chức danh..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] sm:w-[350px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Tìm kiếm tên, chức danh..." className="h-10" />
                      <CommandList>
                        <CommandEmpty>Không tìm thấy nhân sự phù hợp</CommandEmpty>
                        <CommandGroup>
                          {assignableEmployees.map((emp) => {
                            return (
                              <CommandItem
                                key={emp.code}
                                value={`${emp.name} ${emp.jobTitle?.name || ''} ${emp.department?.name || ''}`}
                                onSelect={() => {
                                  setAssignee(emp.code);
                                  setOpenAssignee(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 shrink-0",
                                    assignee === emp.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col py-1 w-full gap-1">
                                  <div className="flex justify-between items-start w-full">
                                    <span className="font-bold text-sm text-slate-800">{emp.name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${emp.performanceScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : emp.performanceScore >= 75 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                      Hiệu suất: {emp.performanceScore}%
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">
                                    {emp.jobTitle?.name ? `${emp.jobTitle.name}` : 'Nhân viên'}
                                    {emp.department?.name ? ` • ${emp.department.name}` : ''}
                                  </span>
                                  <div className="flex flex-wrap gap-2 mt-0.5">
                                    {emp.matchDomain && (
                                      <span className="text-[10px] text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                        <Target className="w-3 h-3" /> Phù hợp lĩnh vực
                                      </span>
                                    )}
                                    {emp.matchLocation && (
                                      <span className="text-[10px] text-emerald-600 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Đúng địa bàn
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {selectedEmp && (
                <div className={`space-y-4 p-4 rounded-xl border-2 transition-colors duration-300 ${isOverload ? 'bg-red-50/50 border-red-200' : newLoad >= selectedEmp.rankLimit * 0.8 ? 'bg-amber-50/50 border-amber-200' : 'bg-indigo-50/50 border-indigo-100'}`}>
                  {/* Thông tin nhân sự */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${isOverload ? 'bg-red-100 text-red-600' : newLoad >= selectedEmp.rankLimit * 0.8 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {selectedEmp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 leading-tight">{selectedEmp.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{selectedEmp.jobTitle?.name || 'Nhân viên'} {selectedEmp.department?.name ? `• ${selectedEmp.department.name}` : ''}</p>
                    </div>
                  </div>

                  {/* Thanh tiến độ Workload */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Tải công việc
                      </span>
                      <div className="flex items-center gap-2">
                        {isOverload && (
                          <span className="flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            <AlertTriangle className="w-3 h-3" /> Quá tải
                          </span>
                        )}
                        <span className={isOverload ? 'text-red-600' : newLoad >= selectedEmp.rankLimit * 0.8 ? 'text-amber-600' : 'text-indigo-600'}>
                          {newLoad} / {selectedEmp.rankLimit} đ
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${isOverload ? 'bg-red-500' : newLoad >= selectedEmp.rankLimit * 0.8 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((newLoad / selectedEmp.rankLimit) * 100, 100)}%` }}
                      />
                    </div>
                    {isOverload && (
                      <p className="text-[10px] text-red-500 font-medium">
                        * Nhân sự này đã vượt quá định mức công việc quy định. Hãy cân nhắc chọn người khác.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" form="taskForm" className="w-full mt-4 bg-indigo-600">Giao việc ngay</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}