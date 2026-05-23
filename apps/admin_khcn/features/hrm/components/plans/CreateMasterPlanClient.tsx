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
import { Bot, LayoutTemplate, Plus, Trash2, Save, Send } from "lucide-react";

export function CreateMasterPlanClient() {
  const router = useRouter();
  
  // --- AI STATE ---
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [planData, setPlanData] = useState<any>(null);

  // --- MANUAL (WBS) STATE ---
  const [isSavingManual, setIsSavingManual] = useState(false);
  const [manualPlan, setManualPlan] = useState({
    title: '',
    objective: '',
    type: 'MASTER_PLAN',
    startDate: '',
    endDate: '',
  });
  const [manualTasks, setManualTasks] = useState<any[]>([
    { title: '', description: '', priority: 'NORMAL', assigneeCode: '', dueDate: '' }
  ]);

  // --- AI HANDLERS ---
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:3000/admin/hrm/master-plans/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setPlanData(json.data);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gọi AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAI = async () => {
    if (!planData) return;
    setIsSavingAI(true);
    try {
      await savePlanToDb(planData);
      alert('Đã tạo Chủ trương và giao việc thành công (AI)!');
      router.push('/services/hrm/plans');
    } catch (err) {
      console.error(err);
      alert('Lỗi hệ thống khi lưu Kế hoạch.');
    } finally {
      setIsSavingAI(false);
    }
  };

  // --- MANUAL HANDLERS ---
  const handleAddManualTask = () => {
    setManualTasks([...manualTasks, { title: '', description: '', priority: 'NORMAL', assigneeCode: '', dueDate: '' }]);
  };

  const handleRemoveManualTask = (index: number) => {
    const newTasks = [...manualTasks];
    newTasks.splice(index, 1);
    setManualTasks(newTasks);
  };

  const handleManualTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...manualTasks];
    newTasks[index][field] = value;
    setManualTasks(newTasks);
  };

  const handleSaveManual = async () => {
    if (!manualPlan.title.trim() || !manualPlan.objective.trim()) {
      alert('Vui lòng nhập đầy đủ Tiêu đề và Mục tiêu Kế hoạch.');
      return;
    }
    setIsSavingManual(true);
    try {
      await savePlanToDb({
        title: manualPlan.title,
        objective: manualPlan.objective,
        startDate: manualPlan.startDate ? new Date(manualPlan.startDate).toISOString() : null,
        endDate: manualPlan.endDate ? new Date(manualPlan.endDate).toISOString() : null,
        type: manualPlan.type,
        status: 'DRAFT',
        tasks: manualTasks.filter(t => t.title.trim() !== '')
      });
      alert('Đã tạo Kế hoạch thủ công thành công!');
      router.push('/services/hrm/plans');
    } catch (err) {
      console.error(err);
      alert('Lỗi hệ thống khi lưu Kế hoạch.');
    } finally {
      setIsSavingManual(false);
    }
  };

  // --- COMMON DB SAVE ---
  const savePlanToDb = async (data: any) => {
    const planRes = await fetch('http://localhost:3000/admin/hrm/master-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        objective: data.objective,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || 'DRAFT',
        type: data.type || 'PROJECT',
      }),
    });
    const planJson = await planRes.json();
    const planId = planJson.data?.id;

    if (planId && data.tasks && data.tasks.length > 0) {
      await Promise.all(data.tasks.map((task: any) => 
        fetch('http://localhost:3000/admin/hrm/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            priority: task.priority || 'NORMAL',
            status: 'TODO',
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            assigneeCode: task.assigneeCode || 'SYSTEM',
            planId: planId,
          })
        })
      ));
    }
    if (!planId) throw new Error("No plan ID returned");
    return planId;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 mb-2">
          Tạo Kế hoạch mới
        </h1>
        <p className="text-muted-foreground">Lựa chọn phương pháp tạo Kế hoạch chiến lược & phân rã công việc.</p>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" /> Chuẩn Quốc tế (WBS)
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> Tạo bằng AI
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MANUAL (CHUẨN QUỐC TẾ) */}
        <TabsContent value="manual" className="space-y-6">
          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden">
             <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
             <CardHeader>
               <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <LayoutTemplate className="h-6 w-6 text-emerald-600" /> Thông tin Master Plan
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2 md:col-span-2">
                 <Label className="font-bold">Tiêu đề Kế hoạch <span className="text-red-500">*</span></Label>
                 <Input 
                   placeholder="VD: Kế hoạch Chuyển đổi số nội bộ Quý 3/2026"
                   value={manualPlan.title}
                   onChange={(e) => setManualPlan({...manualPlan, title: e.target.value})}
                   className="h-12 bg-slate-50"
                 />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <Label className="font-bold">Mục tiêu (Objective) <span className="text-red-500">*</span></Label>
                 <Textarea 
                   placeholder="Mô tả mục tiêu cốt lõi (OKR / SMART)..."
                   value={manualPlan.objective}
                   onChange={(e) => setManualPlan({...manualPlan, objective: e.target.value})}
                   className="bg-slate-50"
                 />
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">Loại kế hoạch</Label>
                 <Select value={manualPlan.type} onValueChange={(val) => setManualPlan({...manualPlan, type: val})}>
                   <SelectTrigger className="h-12 bg-slate-50">
                     <SelectValue placeholder="Chọn loại kế hoạch" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="OKR">OKR (Mục tiêu và Kết quả then chốt)</SelectItem>
                     <SelectItem value="SMART_GOAL">Mục tiêu SMART</SelectItem>
                     <SelectItem value="MASTER_PLAN">Kế hoạch Tổng thể (Master Plan)</SelectItem>
                     <SelectItem value="PROJECT">Dự án thông thường (Project)</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label className="font-bold">Thời gian thực hiện</Label>
                 <div className="flex items-center gap-2">
                   <Input type="date" className="h-12 bg-slate-50" value={manualPlan.startDate} onChange={(e) => setManualPlan({...manualPlan, startDate: e.target.value})} />
                   <span className="text-slate-400">-</span>
                   <Input type="date" className="h-12 bg-slate-50" value={manualPlan.endDate} onChange={(e) => setManualPlan({...manualPlan, endDate: e.target.value})} />
                 </div>
               </div>
             </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-xl font-bold text-slate-800">Phân rã công việc (Work Breakdown Structure)</CardTitle>
                 <p className="text-sm text-slate-500 mt-1">Cấu trúc công việc theo chuẩn quản trị (Giao việc, RACI, Deadline).</p>
               </div>
               <Button onClick={handleAddManualTask} variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200">
                 <Plus className="h-4 w-4 mr-2" /> Thêm Task
               </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {manualTasks.map((task, idx) => (
                <div key={idx} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 transition-all"
                    onClick={() => handleRemoveManualTask(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mr-6">
                    <div className="md:col-span-12 space-y-2">
                       <Label className="text-xs font-semibold text-slate-500">Tên công việc (Task)</Label>
                       <Input placeholder="VD: Thiết kế kiến trúc hệ thống" value={task.title} onChange={e => handleManualTaskChange(idx, 'title', e.target.value)} className="bg-white" />
                    </div>
                    <div className="md:col-span-6 space-y-2">
                       <Label className="text-xs font-semibold text-slate-500">Người thực hiện (Assignee / RACI - R)</Label>
                       <Input placeholder="Mã NV (VD: NV001)" value={task.assigneeCode} onChange={e => handleManualTaskChange(idx, 'assigneeCode', e.target.value)} className="bg-white" />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                       <Label className="text-xs font-semibold text-slate-500">Độ ưu tiên</Label>
                       <Select value={task.priority} onValueChange={(val) => handleManualTaskChange(idx, 'priority', val)}>
                         <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                         <SelectContent>
                           <SelectItem value="URGENT" className="text-rose-600">Khẩn cấp (Urgent)</SelectItem>
                           <SelectItem value="HIGH" className="text-orange-600">Cao (High)</SelectItem>
                           <SelectItem value="NORMAL" className="text-blue-600">Bình thường</SelectItem>
                           <SelectItem value="LOW" className="text-slate-600">Thấp (Low)</SelectItem>
                         </SelectContent>
                       </Select>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                       <Label className="text-xs font-semibold text-slate-500">Hạn chót (Deadline)</Label>
                       <Input type="date" value={task.dueDate} onChange={e => handleManualTaskChange(idx, 'dueDate', e.target.value)} className="bg-white" />
                    </div>
                  </div>
                </div>
              ))}
              {manualTasks.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                  Chưa có công việc nào. Bấm "Thêm Task" để bắt đầu phân rã WBS.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
             <Button onClick={handleSaveManual} disabled={isSavingManual} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 rounded-2xl text-lg shadow-lg shadow-emerald-500/20">
               {isSavingManual ? 'Đang lưu...' : <><Save className="mr-2 h-5 w-5" /> Lưu Kế hoạch Tổng thể</>}
             </Button>
          </div>
        </TabsContent>

        {/* TAB 2: AI (OLD LOGIC) */}
        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Khởi tạo bằng AI (Task Decomposition)
                </CardTitle>
                <p className="text-sm text-gray-500">Dán nội dung Nghị quyết, Văn bản chỉ đạo vào đây để AI tự động phân rã thành Chủ trương và các Đầu việc chi tiết.</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <textarea
                  className="w-full h-80 p-4 rounded-xl border border-indigo-100 bg-white/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all resize-none shadow-inner"
                  placeholder="Nhập nội dung văn bản (VD: Nghị quyết đẩy mạnh CĐS ngành y tế năm 2026...)"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className="relative overflow-hidden w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      AI đang suy nghĩ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">✨</span> Phân tích bằng AI
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    </span>
                  )}
                </button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-800">Kết quả Đề xuất</CardTitle>
                <p className="text-sm text-gray-500">Chủ trương và danh sách các công việc đã được tự động phân rã.</p>
              </CardHeader>
              <CardContent>
                {!planData ? (
                  <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="text-4xl mb-4 opacity-50">🤖</div>
                    <p className="text-gray-400 font-medium">Chưa có kết quả phân tích</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">{planData.title}</h3>
                      <p className="text-sm text-blue-700 mb-3"><span className="font-semibold">Mục tiêu:</span> {planData.objective}</p>
                      <div className="flex gap-4 text-xs font-medium text-blue-600">
                        <span className="px-2 py-1 bg-blue-100 rounded-md">Từ: {new Date(planData.startDate).toLocaleDateString('vi-VN')}</span>
                        <span className="px-2 py-1 bg-blue-100 rounded-md">Đến: {new Date(planData.endDate).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-sm">{planData.tasks.length}</span>
                        Công việc phân rã
                      </h4>
                      <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2">
                        {planData.tasks.map((task: any, idx: number) => (
                          <div key={idx} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-semibold text-sm text-slate-800">{task.title}</h5>
                              <span className={`text-[10px] px-2 py-1 font-bold rounded-full uppercase ${
                                task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                            <div className="flex items-center justify-between text-[11px] font-medium">
                              <span className="text-slate-500">👤 Giao cho: {task.assigneeCode}</span>
                              <span className="text-slate-500">⏳ Hạn: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleSaveAI}
                      disabled={isSavingAI}
                      className="w-full py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-md disabled:opacity-50 mt-4"
                    >
                      {isSavingAI ? 'Đang lưu...' : 'Lưu Kế hoạch & Các công việc'}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
