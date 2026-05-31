"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { aiApi } from '../../../api/ai.api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Save, AlertTriangle, Info, PlusCircle, LayoutDashboard, Target, Sparkles, BrainCircuit, Briefcase, MapPin, Activity } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useTaskTemplatesList, useCreateTask, useHrmEmployeesList } from '../../../hooks';
import { useUser } from '@/hooks/useUser';

export function TaskCreateClient() {
  const router = useRouter();
  const { user } = useUser();
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

  // Lấy nhân sự từ thực tế (gọi API với flag assignableOnly để backend tự động lọc theo quyền)
  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true } as any);
  const employees = employeesData?.data?.map(emp => ({
    code: emp.employeeCode,
    name: `${emp.lastname} ${emp.firstname}`,
    rank: emp.civilServantRank?.code || 'CHUYEN_VIEN',
    rankLimit: (emp.civilServantRank as any)?.limit || 100,
    currentLoad: emp.currentTaskCount || Math.floor(Math.random() * 40), // Mock load for UI demo
    departmentId: emp.departmentId,
    department: emp.department,
    jobTitle: emp.jobTitle,
    email: emp.email,
  })) || [];

  const assignableEmployees = [...employees].sort((a, b) => a.currentLoad - b.currentLoad); // Ưu tiên người có khối lượng công việc thấp nhất lên đầu

  const selectedEmp = employees.find(e => e.code === assignee);

  // Tự động tìm Lãnh đạo theo dõi mảng dựa trên lĩnh vực của phòng ban hoặc chức danh người được giao
  useEffect(() => {
    if (assignee && employeesData?.data && selectedEmp) {
      // 1. Lấy lĩnh vực của người được giao việc
      const unitDomainIds = selectedEmp.department?.domainIds || [];
      const jtDomainId = selectedEmp.jobTitle?.domainId;
      const domainsToMatch = new Set([...unitDomainIds, jtDomainId].filter(d => d != null && d > 0));

      // 2. Tìm Lãnh đạo (GIAM_DOC hoặc PHO_GIAM_DOC) có lĩnh vực phụ trách trùng khớp
      let leader = employeesData.data.find((e) => {
        if (e.jobTitle?.code !== 'PHO_GIAM_DOC' && e.jobTitle?.code !== 'GIAM_DOC') return false;
        return e.jobTitle.domainId && domainsToMatch.has(e.jobTitle.domainId);
      });

      // 3. Fallback: Nếu không tìm thấy, tìm Giám đốc Sở
      if (!leader) {
        leader = employeesData.data.find((e) => e.jobTitle?.code === 'GIAM_DOC');
      }

      if (leader) {
        setSupervisor(leader.employeeCode);
      }
    }
  }, [assignee, selectedEmp?.department?.domainIds, selectedEmp?.jobTitle?.domainId, employeesData?.data]);

  const { data } = useTaskTemplatesList(selectedEmp?.rank);
  const templates = data?.data || [];

  const { mutateAsync: createTask } = useCreateTask();

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const t = templates.find(x => x.id === Number(templateId));
    if (t) setTaskName(t.taskName);
  };

  // Tính load cũ (hiện bỏ logic headcount vì đây là giao việc cụ thể)
  // Nhưng vẫn giữ minh họa Workload = số lượng task đang làm (vd: mockLimit)
  const newLoad = selectedEmp ? selectedEmp.currentLoad + taskWeight : 0;
  const isOverload = selectedEmp ? newLoad > selectedEmp.rankLimit : false;

  const handleAiAssign = async () => {
    if (!aiInstruction.trim()) {
      toast.error('Vui lòng nhập yêu cầu công việc để AI phân tích.');
      return;
    }

    setIsAiLoading(true);
    try {
      const employeesContext = employees.map(e => `${e.code} - ${e.name} (Ngạch: ${e.rank}, Load: ${e.currentLoad}/${e.rankLimit})`).join('\\n');

      const initRes = await aiApi.generateTaskAssignment({
        instruction: aiInstruction,
        employeesContext
      });

      if (initRes.jobId) {
        const intervalId = setInterval(async () => {
          try {
            const jobStatus = await aiApi.getAiJobStatus(initRes.jobId);
            if (jobStatus.status === 'COMPLETED') {
              clearInterval(intervalId);
              setIsAiLoading(false);

              const result = jobStatus.result || jobStatus.data;
              if (result) {
                if (result.taskName) setTaskName(result.taskName);
                if (result.assigneeCode && employees.find(e => e.code === result.assigneeCode)) setAssignee(result.assigneeCode);
                if (result.startDate) setStartDate(result.startDate);
                if (result.dueDate) setDueDate(result.dueDate);
                if (result.priority) setPriority(result.priority);
                if (result.weight) setTaskWeight(result.weight);
                if (result.baseScore) setBaseScore(result.baseScore);

                toast.success('AI đã phân tích và điền form thành công! Lý do: ' + (result.reasoning || ''));
              }
            } else if (jobStatus.status === 'FAILED') {
              clearInterval(intervalId);
              setIsAiLoading(false);
              toast.error(jobStatus.error || 'Lỗi trong quá trình AI phân tích');
            }
          } catch (e) {
            console.warn('Polling error', e);
          }
        }, 2000);
      }
    } catch (e: any) {
      setIsAiLoading(false);
      toast.error(e.message || 'Có lỗi xảy ra khi gọi AI');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverload) {
      toast.error('Cảnh báo: Khối lượng công việc vượt quá định mức ngạch của nhân sự!');
    } else {
      try {
        await createTask({
          assigneeCode: assignee,
          supervisorCode: supervisor,
          assignerCode: user?.employeeCode || '', // Lấy từ auth token context nếu có
          taskName,
          weight: taskWeight,
          startDate,
          dueDate,
          priority,
          baseScore,
          templateId: selectedTemplateId
        });
        toast.success('Giao việc thành công!');
        router.push('/services/hrm/work-plans/tasks');
      } catch (err) {
        toast.error('Lỗi khi giao việc');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/services/hrm/work-plans/tasks')} className="text-slate-500 hover:text-slate-900">
            &larr; Quay lại
          </Button>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-8 h-8 text-indigo-600" />
            Giao Việc Mới
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <Card className="shadow-sm border-indigo-100 bg-indigo-50/30">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-md flex items-center gap-2 text-indigo-800">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Phân công tự động bằng AI
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Yêu cầu công việc (Nói bằng ngôn ngữ tự nhiên)</label>
                <Textarea
                  placeholder="Ví dụ: Giao cho một bạn làm frontend thiết kế trang chủ mới trong 3 ngày tới, độ ưu tiên cao..."
                  value={aiInstruction}
                  onChange={e => setAiInstruction(e.target.value)}
                  className="bg-white resize-none"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleAiAssign}
                disabled={isAiLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold"
              >
                {isAiLoading ? (
                  <span className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 animate-pulse" /> Đang phân tích và tìm kiếm nhân sự...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Gợi ý Phân công ngay
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Thông tin Công việc</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Tên công việc</label>
                  <Input
                    placeholder="Nhập tên công việc hoặc chọn từ định biên bên dưới..."
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Ngày bắt đầu</label>
                    <Input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Hạn chót</label>
                    <Input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Mức độ ưu tiên</label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HIGH">Cao</SelectItem>
                        <SelectItem value="MEDIUM">Trung bình</SelectItem>
                        <SelectItem value="LOW">Thấp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-black uppercase text-indigo-600 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Cấu hình KPI & Trọng số
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Trọng số KPI (%)</label>
                      <Input type="number" min="1" value={taskWeight} onChange={e => setTaskWeight(Number(e.target.value))} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Điểm cơ bản (Base Score)</label>
                      <Input type="number" value={baseScore} onChange={e => setBaseScore(Number(e.target.value))} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Thưởng vượt tiến độ / Ngày</label>
                      <Input type="number" defaultValue={0} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Phạt trễ hạn / Ngày</label>
                      <Input type="number" defaultValue={0} />
                    </div>
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="shadow-sm border-indigo-100">
            <CardHeader className="bg-indigo-50 border-b border-indigo-100">
              <CardTitle className="text-sm font-bold text-indigo-900">Phân công theo Ngạch</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Đầu mối chủ trì xử lý chính</label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="bg-white h-auto py-3">
                    <SelectValue placeholder="Chọn nhân sự..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {assignableEmployees.map(emp => {
                      const loadRatio = emp.currentLoad / emp.rankLimit;
                      const isFree = loadRatio < 0.5;
                      const isOverloaded = loadRatio > 0.9;
                      return (
                        <SelectItem key={emp.code} value={emp.code} className="py-3 focus:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                          <div className="flex flex-col gap-1.5 w-[320px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-sm">{emp.name}</span>
                              <Badge variant="outline" className={`text-[10px] ${isFree ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : isOverloaded ? 'border-rose-200 text-rose-700 bg-rose-50' : 'border-slate-200 text-slate-600'}`}>
                                {emp.jobTitle?.name || 'Chuyên viên'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-medium">
                                <Briefcase className="w-3 h-3 text-indigo-400" /> Đang xử lý: <span className={isOverloaded ? 'text-rose-600 font-bold' : 'text-slate-700'}>{emp.currentLoad}/{emp.rankLimit}</span>
                              </span>
                              {isFree && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-[9px] px-1.5 py-0 leading-tight h-4">Trống việc</Badge>}
                              {isOverloaded && <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 text-[9px] px-1.5 py-0 leading-tight h-4">Quá tải</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1 truncate" title="Lĩnh vực: Quản lý khoa học, Đổi mới sáng tạo">
                                <Activity className="w-3 h-3" /> Phù hợp lĩnh vực
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 truncate" title="Địa bàn: Tỉnh Đắk Lắk">
                                <MapPin className="w-3 h-3" /> Đúng địa bàn
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                    {assignableEmployees.length === 0 && (
                      <SelectItem value="none" disabled className="text-slate-500 italic">
                        Không có quyền giao việc hoặc không có nhân sự cấp dưới trực tiếp
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Lãnh đạo Sở theo dõi, chỉ đạo</label>
                <div className="p-2 border border-orange-200 bg-orange-50 rounded-md text-sm text-slate-700 font-medium h-9 flex items-center">
                  {supervisor ? employees.find(e => e.code === supervisor)?.name : "Hệ thống sẽ tự động chỉ định..."}
                </div>
              </div>

              {selectedEmp && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">Ngạch hiện tại:</span>
                    <Badge variant="outline" className="font-mono">{selectedEmp.rank}</Badge>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="text-xs font-bold text-indigo-700 flex items-center gap-2">
                      <Target className="w-3 h-3" /> Chọn Công việc Định biên
                    </label>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                      <SelectTrigger className="bg-white text-xs h-9">
                        <SelectValue placeholder="--- Tùy chọn nhập tay ---" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="text-xs">
                            {t.taskName} ({t.defaultUnit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">Khối lượng (Workload)</span>
                      <span className={isOverload ? 'text-red-600' : 'text-indigo-600'}>
                        {newLoad} / {selectedEmp.rankLimit}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isOverload ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((newLoad / selectedEmp.rankLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {isOverload && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-xs mt-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span className="font-medium">Nhân sự này đã đạt giới hạn định mức công việc của ngạch. Việc giao thêm có thể gây quá tải.</span>
                    </div>
                  )}
                </div>
              )}

              <Button type="submit" form="taskForm" className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                <Save className="w-4 h-4 mr-2" />
                Giao việc ngay
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
