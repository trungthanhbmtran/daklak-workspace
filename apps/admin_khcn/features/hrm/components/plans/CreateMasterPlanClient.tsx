"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LayoutTemplate, Plus, Trash2, Save, Users, Target, Activity, ArrowLeft, Settings2, Clock, CheckCircle2 } from "lucide-react";
import { hrmPlansApi, hrmTasksApi, hrmKpiCriteriaApi } from "@/features/hrm/api";
import { useGetCategories } from "@/features/system-admin/categories/hooks/useCategoryApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function CreateMasterPlanClient() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const { data: categories = [] } = useGetCategories();
  const planFrameworkCategories = categories.filter((c: any) => c.group === "PLAN_FRAMEWORK");

  // State lưu danh sách thư viện Tiêu chí
  const [criteriaLibrary, setCriteriaLibrary] = React.useState<any[]>([]);

  React.useEffect(() => {
    hrmKpiCriteriaApi.list().then(res => setCriteriaLibrary(res.data || []));
  }, []);

  // Plan Data
  const [plan, setPlan] = useState({
    title: '',
    objective: '',
    type: 'MASTER_PLAN',
    startDate: '',
    endDate: '',
  });

  // Task Data
  const [tasks, setTasks] = useState<any[]>([
    {
      title: '',
      description: '',
      priority: 'NORMAL',
      assigneeCode: '',
      dueDate: '',
      baseScore: 100,
      weight: 100,
      scoringMethod: 'MANUAL',
      difficulty: 'NORMAL',
      difficultyMultiplier: 1.0,
      bonusThresholdDays: 0,
      bonusPerDay: 0,
      penaltyPerDay: 0,
      supervisorCode: '',
      isKpiLocked: false,
      kpiCriteriaId: null
    }
  ]);

  // Modal State for Assignee Selection
  const [isAssigneeModalOpen, setIsAssigneeModalOpen] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number | null>(null);

  // Fake data for assignee selection
  const departments = ["Phòng Kế hoạch", "Phòng Hành chính", "Phòng Chuyên môn", "Ban Giám đốc"];
  const fields = ["Chuyển đổi số", "Tổ chức cán bộ", "Tài chính", "Đầu tư"];
  const employees = [
    { code: "NV001", name: "Nguyễn Văn A", dept: "Phòng Kế hoạch" },
    { code: "NV002", name: "Trần Thị B", dept: "Phòng Hành chính" },
    { code: "NV003", name: "Lê Văn C", dept: "Phòng Chuyên môn" },
    { code: "NV004", name: "Phạm Thị D", dept: "Ban Giám đốc" },
  ];

  const [filterDept, setFilterDept] = useState("");
  const [filterField, setFilterField] = useState("");

  const handleTaskChange = (index: number, field: string, value: any) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const addTask = () => {
    setTasks([...tasks, {
      title: '', description: '', priority: 'NORMAL', assigneeCode: '', dueDate: '',
      baseScore: 100, weight: 10, scoringMethod: 'MANUAL', 
      difficulty: 'NORMAL', difficultyMultiplier: 1.0, bonusThresholdDays: 0,
      bonusPerDay: 0, penaltyPerDay: 0, supervisorCode: '', isKpiLocked: false, kpiCriteriaId: null
    }]);
    toast.success("Đã thêm một mục tiêu con mới");
  };

  const removeTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const openAssigneeModal = (index: number) => {
    setCurrentTaskIndex(index);
    setIsAssigneeModalOpen(true);
  };

  const selectAssignee = (code: string) => {
    if (currentTaskIndex !== null) {
      handleTaskChange(currentTaskIndex, 'assigneeCode', code);
    }
    setIsAssigneeModalOpen(false);
    toast.success(`Đã phân công cho nhân sự ${code}`);
  };

  const applyKpiCriteria = (taskIndex: number, criteriaId: string) => {
    if (criteriaId === "NONE") {
      const newTasks = [...tasks];
      newTasks[taskIndex].isKpiLocked = false;
      newTasks[taskIndex].kpiCriteriaId = null;
      setTasks(newTasks);
      return;
    }

    const criteria = criteriaLibrary.find(c => c.id.toString() === criteriaId);
    if (criteria) {
      const newTasks = [...tasks];
      newTasks[taskIndex] = {
        ...newTasks[taskIndex],
        kpiCriteriaId: criteria.id,
        isKpiLocked: true, // Khóa cứng
        baseScore: criteria.baseScore,
        weight: criteria.weight,
        scoringMethod: criteria.scoringMethod,
        difficulty: criteria.difficulty,
        difficultyMultiplier: criteria.difficultyMultiplier,
        bonusThresholdDays: criteria.bonusThresholdDays,
        bonusPerDay: criteria.bonusPerDay,
        penaltyPerDay: criteria.penaltyPerDay,
      };
      setTasks(newTasks);
      toast.success("Đã áp dụng công thức từ Thư viện");
    }
  };

  // Tính toán Tên giao diện (Dynamic UI)
  const getUiLabels = () => {
    if (plan.type === "OKR") {
      return { tab1: "1. Mục tiêu (Objective)", tab2: "2. Kết quả then chốt (Key Results)", taskPrefix: "KR", taskTitle: "Kết quả then chốt (KR)" };
    }
    if (plan.type === "PROJECT") {
      return { tab1: "1. Tổng quan Dự án", tab2: "2. Giai đoạn & Nhiệm vụ", taskPrefix: "TASK", taskTitle: "Nhiệm vụ / Milestones" };
    }
    return { tab1: "1. Kế hoạch Tổng thể", tab2: "2. Phân rã công việc (WBS)", taskPrefix: "WBS", taskTitle: "Hạng mục công việc" };
  };
  const uiLabels = getUiLabels();

  const handleSave = async () => {
    if (!plan.title.trim() || !plan.objective.trim()) {
      toast.error('Vui lòng nhập đầy đủ Tiêu đề và Mục tiêu tổng thể.');
      return;
    }
    setIsSaving(true);
    try {
      // 1. Tạo Plan
      const planRes = await hrmPlansApi.create({
        title: plan.title,
        objective: plan.objective,
        startDate: plan.startDate ? new Date(plan.startDate).toISOString() : null,
        endDate: plan.endDate ? new Date(plan.endDate).toISOString() : null,
        type: plan.type,
        status: 'ACTIVE',
      });

      const planId = planRes.data?.id;

      // 2. Tạo Tasks với KPI configurations
      if (planId && tasks.length > 0) {
        await Promise.all(tasks.filter(t => t.title.trim() !== '').map((task: any) =>
          hrmTasksApi.create({
            title: task.title,
            description: task.description,
            priority: task.priority || 'NORMAL',
            status: 'TODO',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            assigneeCode: task.assigneeCode || 'SYSTEM',
            planId: planId,
            baseScore: Number(task.baseScore) || 0,
            weight: Number(task.weight) || 0,
            scoringMethod: task.scoringMethod,
            bonusPerDay: Number(task.bonusPerDay) || 0,
            penaltyPerDay: Number(task.penaltyPerDay) || 0,
            supervisorCode: task.supervisorCode || 'SYSTEM'
          })
        ));
      }
      toast.success('Khởi tạo Kế hoạch & Mục tiêu thành công!');
      router.push('/services/hrm/plans');
    } catch (err) {
      console.error(err);
      toast.error('Lỗi hệ thống khi lưu Kế hoạch.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Target className="w-8 h-8 text-indigo-600" />
            Khởi tạo Kế hoạch Chiến lược & Mục tiêu Tổng thể
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Mô hình Quản trị theo Mục tiêu (OKR) kết hợp phân rã cấu trúc công việc (WBS) và chấm điểm tự động.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()} className="h-11 rounded-xl">Hủy bỏ</Button>
          <Button onClick={handleSave} disabled={isSaving} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 px-8">
            {isSaving ? 'Đang lưu...' : <><CheckCircle2 className="w-5 h-5 mr-2" /> Ban hành Kế hoạch</>}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 h-12 p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="info" className="rounded-lg text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
            {uiLabels.tab1}
          </TabsTrigger>
          <TabsTrigger value="kpi" className="rounded-lg text-base font-semibold data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
            {uiLabels.tab2}
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: THÔNG TIN CƠ SỞ */}
        <TabsContent value="info" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <LayoutTemplate className="text-indigo-500 w-6 h-6" /> Định hình Mục tiêu Cấp cao
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-slate-700">Tên Kế hoạch / Chiến dịch <span className="text-rose-500">*</span></Label>
                  <Input
                    placeholder="VD: Kế hoạch Chuyển đổi số toàn diện Quý 3/2026"
                    value={plan.title}
                    onChange={(e) => setPlan({ ...plan, title: e.target.value })}
                    className="h-14 text-lg font-bold bg-slate-50 focus:bg-white rounded-xl border-slate-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-slate-700">Mục tiêu Cốt lõi (Objective - O) <span className="text-rose-500">*</span></Label>
                  <Textarea
                    placeholder="Mô tả tham vọng, tác động và kết quả kỳ vọng ở mức vĩ mô..."
                    value={plan.objective}
                    onChange={(e) => setPlan({ ...plan, objective: e.target.value })}
                    className="min-h-[120px] bg-slate-50 focus:bg-white rounded-xl border-slate-200 resize-none text-base p-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Mô hình Quản trị</Label>
                  <Select value={plan.type} onValueChange={(val) => setPlan({ ...plan, type: val })}>
                    <SelectTrigger className="h-12 bg-slate-50 rounded-xl">
                      <SelectValue placeholder="Chọn mô hình quản trị" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MASTER_PLAN">Kế hoạch Tổng thể (Master Plan)</SelectItem>
                      <SelectItem value="OKR">Quản trị theo Mục tiêu (OKR)</SelectItem>
                      <SelectItem value="PROJECT">Dự án trọng điểm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Khung thời gian (Timeframe)</Label>
                  <div className="flex items-center gap-3">
                    <Input type="date" className="h-12 bg-slate-50 rounded-xl flex-1" value={plan.startDate} onChange={(e) => setPlan({ ...plan, startDate: e.target.value })} />
                    <span className="text-slate-400 font-bold">→</span>
                    <Input type="date" className="h-12 bg-slate-50 rounded-xl flex-1" value={plan.endDate} onChange={(e) => setPlan({ ...plan, endDate: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                <Button onClick={() => setActiveTab("kpi")} className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8">
                  Tiếp theo: Phân rã Mục tiêu <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: WBS & KPI */}
        <TabsContent value="kpi" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{uiLabels.tab2} & Cấu hình KPI</h2>
              <p className="text-slate-500 font-medium">Thiết lập các {uiLabels.taskTitle}, giao việc và cài đặt công thức tính điểm.</p>
            </div>
            <Button onClick={addTask} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20">
              <Plus className="w-5 h-5 mr-2" /> Thêm {uiLabels.taskTitle}
            </Button>
          </div>

          <div className="space-y-6">
            {tasks.map((task, idx) => (
              <Card key={idx} className="border-0 shadow-lg bg-white rounded-2xl overflow-visible relative group border-l-4 border-l-indigo-500">
                <Button
                  variant="ghost" size="icon"
                  className="absolute -top-3 -right-3 h-8 w-8 bg-white border border-slate-200 text-rose-500 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => removeTask(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Phần 1: Thông tin Task & Phân công */}
                    <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded-md">{uiLabels.taskPrefix} {idx + 1}</span>
                        <h4 className="font-bold text-slate-800">{uiLabels.taskTitle}</h4>
                      </div>

                      <div className="space-y-4">
                        <Input
                          placeholder={`VD: Mô tả ${uiLabels.taskTitle}...`}
                          value={task.title}
                          onChange={e => handleTaskChange(idx, 'title', e.target.value)}
                          className="h-12 text-base font-semibold bg-slate-50/50 rounded-xl"
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3" /> Người thực hiện (Assignee)
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                value={task.assigneeCode}
                                readOnly
                                placeholder="Chọn nhân sự..."
                                className="h-10 bg-slate-50 cursor-pointer"
                                onClick={() => openAssigneeModal(idx)}
                              />
                              <Button variant="outline" onClick={() => openAssigneeModal(idx)} className="h-10 px-3 shrink-0">Chọn</Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Hạn chót (Deadline)
                            </Label>
                            <Input type="date" value={task.dueDate} onChange={e => handleTaskChange(idx, 'dueDate', e.target.value)} className="h-10 bg-slate-50" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Phần 2: Cấu hình KPI Chấm điểm */}
                    <div className="lg:col-span-5 p-6 bg-slate-50/50 rounded-r-2xl border-l border-slate-100 relative">
                      {task.isKpiLocked && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl z-10">
                          ĐÃ KHÓA CẤU HÌNH TỪ THƯ VIỆN
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4 text-emerald-600" />
                          <h4 className="font-bold text-slate-800">Cấu hình tính điểm (KPI)</h4>
                        </div>
                        <Select value={task.kpiCriteriaId?.toString() || "NONE"} onValueChange={(val) => applyKpiCriteria(idx, val)}>
                          <SelectTrigger className="h-8 text-xs bg-white border-indigo-200 text-indigo-700 font-semibold w-[160px]">
                            <SelectValue placeholder="Chọn từ thư viện" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NONE">Tùy chỉnh thủ công</SelectItem>
                            {criteriaLibrary.map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={`grid grid-cols-2 gap-x-4 gap-y-4 ${task.isKpiLocked ? 'opacity-70 pointer-events-none' : ''}`}>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500 font-medium">Trọng số (%)</Label>
                          <div className="relative">
                            <Input type="number" value={task.weight} onChange={e => handleTaskChange(idx, 'weight', e.target.value)} className="h-9 pr-8 bg-white" />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500 font-medium">Điểm chuẩn (Base)</Label>
                          <Input type="number" value={task.baseScore} onChange={e => handleTaskChange(idx, 'baseScore', e.target.value)} className="h-9 bg-white" />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500 font-medium">Độ khó</Label>
                          <Select value={task.difficulty} onValueChange={(val) => handleTaskChange(idx, 'difficulty', val)}>
                            <SelectTrigger className="h-9 bg-white text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EASY">Dễ</SelectItem>
                              <SelectItem value="NORMAL">Bình thường</SelectItem>
                              <SelectItem value="HARD">Khó</SelectItem>
                              <SelectItem value="COMPLEX">Phức tạp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500 font-medium">Hệ số Độ khó</Label>
                          <Input type="number" step="0.1" value={task.difficultyMultiplier} onChange={e => handleTaskChange(idx, 'difficultyMultiplier', e.target.value)} className="h-9 bg-white" />
                        </div>

                        <div className="col-span-2 space-y-1.5">
                          <Label className="text-xs text-slate-500 font-medium">Cách tính điểm</Label>
                          <Select value={task.scoringMethod} onValueChange={(val) => handleTaskChange(idx, 'scoringMethod', val)}>
                            <SelectTrigger className="h-9 bg-white text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MANUAL">Giám sát đánh giá thủ công</SelectItem>
                              <SelectItem value="AUTO_DEADLINE">Tự động (Dựa trên ngày hoàn thành)</SelectItem>
                              <SelectItem value="AUTO_RESULT">Tự động (Dựa trên khối lượng hoàn thành)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs text-emerald-600 font-medium">Thưởng (sớm {task.bonusThresholdDays} ngày)</Label>
                          <div className="relative">
                            <Input type="number" value={task.bonusPerDay} onChange={e => handleTaskChange(idx, 'bonusPerDay', e.target.value)} className="h-9 pr-12 text-emerald-700 bg-emerald-50/50" placeholder="+1" />
                            <span className="absolute right-3 top-2.5 text-[10px] text-emerald-500 font-bold">đ/ngày</span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-rose-600 font-medium">Phạt (chậm tiến độ)</Label>
                          <div className="relative">
                            <Input type="number" value={task.penaltyPerDay} onChange={e => handleTaskChange(idx, 'penaltyPerDay', e.target.value)} className="h-9 pr-12 text-rose-700 bg-rose-50/50" placeholder="-2" />
                            <span className="absolute right-3 top-2.5 text-[10px] text-rose-500 font-bold">đ/ngày</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700">Chưa có {uiLabels.taskTitle} nào</h3>
                <p className="text-slate-500 mb-4">Hãy thêm các phân rã cấu trúc để thực hiện Kế hoạch.</p>
                <Button onClick={addTask} variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  <Plus className="w-4 h-4 mr-2" /> Thêm ngay
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL LỌC VÀ CHỌN NHÂN SỰ */}
      <Dialog open={isAssigneeModalOpen} onOpenChange={setIsAssigneeModalOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-slate-50">
          <DialogHeader className="p-6 bg-white border-b border-slate-100">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" /> Chọn Nhân sự thực hiện
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Bộ lọc: Phòng ban / Đơn vị</Label>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Tất cả phòng ban" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                    {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase">Bộ lọc: Lĩnh vực / Mảng</Label>
                <Select value={filterField} onValueChange={setFilterField}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Tất cả lĩnh vực" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả lĩnh vực</SelectItem>
                    {fields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Mã NV</th>
                    <th className="px-4 py-3">Họ và Tên</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.filter(e => filterDept && filterDept !== 'ALL' ? e.dept === filterDept : true).map((emp) => (
                    <tr key={emp.code} className="hover:bg-indigo-50/50 transition-colors group">
                      <td className="px-4 py-3 font-mono text-slate-600">{emp.code}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{emp.name}</td>
                      <td className="px-4 py-3 text-slate-600">{emp.dept}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white"
                          onClick={() => selectAssignee(emp.code)}
                        >
                          Chọn Giao
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
