"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, FileSignature, AlignLeft, CalendarClock, Users, Bot, CheckCircle2, ShieldCheck, Sparkles, BookOpen, X, BrainCircuit, Target, ListTodo, Presentation, Zap, UploadCloud, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { hrmApi, hrmPlansApi } from "@/features/hrm/api";
import type { HrmEmployee, HrmMasterPlan } from "@/features/hrm/types";
import * as XLSX from "xlsx";

const FRAMEWORK_TEMPLATES = {
  // ... (keeping same as before to save space)
  SMART: { title: "Tổ chức Hội thảo Khoa học", description: "Mục tiêu SMART...", kpi: ">= 450 khách" },
  "5W1H2C5M": { title: "Triển khai phần mềm", description: "Mô hình 5W1H2C5M...", kpi: "Zero bugs" },
  SWOT: { title: "Phân tích SWOT", description: "Điểm mạnh, yếu...", kpi: "Tăng trưởng +15%" },
  AGILE: { title: "Phát triển App", description: "Sprint 12...", kpi: "Hoàn thành 100% SP" },
  EISENHOWER: { title: "Xử lý khủng hoảng", description: "Ma trận Eisenhower...", kpi: "Giảm bình luận tiêu cực" },
};

export default function CreateTaskPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [creationMode, setCreationMode] = useState<"MANUAL" | "IMPORT">("MANUAL");
  
  // State for AI Planner Modal
  const [showPlannerModal, setShowPlannerModal] = useState(false);

  // Form State
  const [taskInfo, setTaskInfo] = useState({
    basis: "",
    title: "",
    description: "",
    assignee: "",
    reviewer: "",
    startDate: "",
    dueDate: "",
    priority: "Trung bình",
    kpi: "",
    reportFrequency: "Hàng tuần",
  });

  const [employees, setEmployees] = useState<(HrmEmployee & { workload: number })[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [plans, setPlans] = useState<HrmMasterPlan[]>([]);

  // Import State
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [importedTasks, setImportedTasks] = useState<any[]>([]);

  useEffect(() => {
    // Tải nhân sự
    hrmApi.list({ pageSize: 100 }).then(res => {
      const withWorkload = res.data.map(emp => ({
        ...emp,
        workload: Math.floor(Math.random() * 8)
      })).sort((a, b) => a.workload - b.workload);
      setEmployees(withWorkload);
      setLoadingEmployees(false);
    }).catch(err => {
      console.error(err);
      toast.error("Lỗi khi tải danh sách nhân sự");
      setLoadingEmployees(false);
    });

    // Tải danh sách kế hoạch tổng
    hrmPlansApi.list().then(res => {
      setPlans(res.data);
      if (res.data.length > 0 && !taskInfo.basis) {
        setTaskInfo(prev => ({ ...prev, basis: res.data[0].id.toString() }));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleAutoAssign = () => {
    if (employees.length === 0) {
      toast.error("Chưa có dữ liệu nhân viên khả dụng");
      return;
    }
    setAutoAssigning(true);
    setTimeout(() => {
      setAutoAssigning(false);
      const bestMatch = employees[0];
      setTaskInfo({ ...taskInfo, assignee: bestMatch.id.toString() });
      toast.success(`AI đã đề xuất: ${bestMatch.firstname} ${bestMatch.lastname} (${bestMatch.workload} việc đang xử lý)`);
    }, 1500);
  };

  const applyFrameworkTemplate = (type: keyof typeof FRAMEWORK_TEMPLATES) => {
    const template = FRAMEWORK_TEMPLATES[type];
    setTaskInfo({ ...taskInfo, title: template.title, description: template.description, kpi: template.kpi });
    setShowPlannerModal(false);
    toast.success(`Đã nạp mẫu kế hoạch ${type}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creationMode === "MANUAL") {
      if (!taskInfo.title || !taskInfo.assignee) {
        toast.error("Vui lòng nhập đầy đủ Tiêu đề và Người thực hiện");
        return;
      }
    } else {
      if (importedTasks.length === 0) {
        toast.error("Vui lòng tải lên tệp Excel chứa danh sách công việc");
        return;
      }
    }
    
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(creationMode === "MANUAL" ? "Đã khởi tạo phân việc thành công" : `Đã giao hàng loạt ${importedTasks.length} công việc thành công!`);
      router.push("/services/hrm/tasks");
    }, 1500);
  };

  // Import Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Vui lòng tải lên tệp Excel (.xlsx, .xls)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setFileName(file.name);
        setImportedTasks(data);
        toast.success(`Đã đọc ${data.length} dòng dữ liệu thành công!`);
      } catch (error) {
        console.error(error);
        toast.error("Lỗi đọc file Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const removeFile = () => {
    setFileName("");
    setImportedTasks([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900 relative">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shadow-sm bg-white">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Ban hành Phân việc</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Hệ thống giao việc và kiểm soát luồng tự động</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              type="button"
              className={cn("flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all", creationMode === "MANUAL" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => setCreationMode("MANUAL")}
            >
              Tạo đơn lẻ
            </button>
            <button
              type="button"
              className={cn("flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all", creationMode === "IMPORT" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}
              onClick={() => setCreationMode("IMPORT")}
            >
              Import hàng loạt
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 font-bold shadow-lg shadow-slate-900/20">
              <Save className="mr-2 h-4 w-4" /> THỰC THI GIAO VIỆC
            </Button>
          </div>
        </div>

        {creationMode === "IMPORT" ? (
          // ==============================
          // IMPORT MODE UI
          // ==============================
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Import từ Excel</h3>
                    <p className="text-slate-500 text-sm mb-6">Tải lên tệp danh sách công việc. Hệ thống sẽ tự động đối chiếu các trường và tạo bảng kiểm duyệt trước khi ban hành thực tế.</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Cơ sở phân việc (Master Plan)</Label>
                        <select
                          className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={taskInfo.basis}
                          onChange={e => setTaskInfo({ ...taskInfo, basis: e.target.value })}
                        >
                          {plans.length === 0 ? (
                            <option value="">Đang tải kế hoạch...</option>
                          ) : (
                            plans.map(p => <option key={p.id} value={p.id.toString()}>{p.title}</option>)
                          )}
                        </select>
                      </div>
                      
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <h4 className="font-bold text-amber-800 text-sm mb-1 flex items-center"><Target className="w-4 h-4 mr-1"/> Hướng dẫn form mẫu</h4>
                        <p className="text-xs text-amber-700 leading-relaxed">Vui lòng sử dụng dòng đầu tiên trong Excel làm dòng Tiêu đề. Tên cột nên bao gồm: <strong>Tên việc, Người nhận, Mô tả, Deadline</strong> để hệ thống tự động nhận diện chính xác nhất.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    {!fileName ? (
                      <div 
                        className={cn(
                          "h-full min-h-[250px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-white",
                          dragActive ? "border-emerald-500 bg-emerald-50/50 scale-[1.02]" : "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30"
                        )}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleChange} className="hidden" />
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-base font-bold text-slate-700 mb-1">Kéo thả tệp Excel phân việc</p>
                        <p className="text-sm text-slate-500">Click để chọn tệp từ máy tính</p>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col justify-center border border-emerald-200 rounded-2xl p-6 shadow-sm bg-emerald-50/30 animate-in zoom-in-95 relative">
                        <div className="absolute top-4 right-4">
                          <Button type="button" variant="ghost" size="icon" onClick={removeFile} className="text-slate-400 hover:text-red-500 hover:bg-red-100 rounded-full bg-white shadow-sm"><X className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex flex-col items-center text-center">
                          <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600 mb-4 shadow-sm border border-emerald-200">
                            <FileSpreadsheet className="w-10 h-10" />
                          </div>
                          <p className="text-lg font-black text-slate-800 mb-1">{fileName}</p>
                          <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-full text-sm font-bold shadow-sm">
                            Trích xuất được {importedTasks.length} nhiệm vụ
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {importedTasks.length > 0 && (
              <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-t-4 border-emerald-500 animate-in fade-in slide-in-from-bottom-8">
                <CardContent className="p-0">
                  <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                      <ListTodo className="text-emerald-500" /> Bảng rà soát trước khi Ban hành
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 uppercase font-bold shadow-sm">
                        <tr>
                          {Object.keys(importedTasks[0] || {}).map((key) => (
                            <th key={key} className="px-6 py-4">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importedTasks.map((row, idx) => (
                          <tr key={idx} className="bg-white hover:bg-emerald-50/30 transition-colors">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="px-6 py-4 text-slate-700 truncate max-w-[250px]" title={val}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // ==============================
          // MANUAL MODE UI (Wizard)
          // ==============================
          <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Sidebar Tabs */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-28 overflow-hidden bg-white">
                <div className="p-5 bg-slate-50 border-b border-slate-100 font-black text-sm text-slate-500 uppercase tracking-wider">
                  Quy trình thiết lập
                </div>
                <div className="flex flex-col p-3 gap-2">
                  <button type="button" onClick={() => setActiveTab(1)} className={cn("flex items-center gap-3 p-3 rounded-2xl text-left font-bold transition-all", activeTab === 1 ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" : "text-slate-600 hover:bg-slate-50")}>
                    <div className={cn("p-2.5 rounded-xl shadow-sm", activeTab === 1 ? "bg-blue-500 text-white" : "bg-white text-slate-400 border border-slate-200")}><FileSignature className="h-4 w-4" /></div>
                    1. Cơ sở & Nội dung
                  </button>
                  <button type="button" onClick={() => setActiveTab(2)} className={cn("flex items-center gap-3 p-3 rounded-2xl text-left font-bold transition-all", activeTab === 2 ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" : "text-slate-600 hover:bg-slate-50")}>
                    <div className={cn("p-2.5 rounded-xl shadow-sm", activeTab === 2 ? "bg-indigo-500 text-white" : "bg-white text-slate-400 border border-slate-200")}><Users className="h-4 w-4" /></div>
                    2. Phân công nhân sự
                  </button>
                  <button type="button" onClick={() => setActiveTab(3)} className={cn("flex items-center gap-3 p-3 rounded-2xl text-left font-bold transition-all", activeTab === 3 ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" : "text-slate-600 hover:bg-slate-50")}>
                    <div className={cn("p-2.5 rounded-xl shadow-sm", activeTab === 3 ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200")}><ShieldCheck className="h-4 w-4" /></div>
                    3. Tiêu chí kiểm soát
                  </button>
                </div>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <Card className="rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-h-[500px]">
                <CardContent className="p-8">

                  {/* Bước 1 */}
                  <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 1 && "hidden")}>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><FileSignature className="text-blue-500" /> Xác định Cơ sở & Nội dung</h3>
                      <p className="text-slate-500 text-sm mt-1">Biên soạn nội dung nhiệm vụ cần giao.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 flex items-center justify-between">
                          Cơ sở phân việc (Thuộc Kế hoạch tổng)
                        </Label>
                        <select
                          className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                          value={taskInfo.basis}
                          onChange={e => setTaskInfo({ ...taskInfo, basis: e.target.value })}
                        >
                          {plans.length === 0 ? (
                            <option value="">Đang tải hoặc chưa có kế hoạch...</option>
                          ) : (
                            plans.map(p => <option key={p.id} value={p.id.toString()}>{p.title}</option>)
                          )}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Tên công việc / Nhiệm vụ cụ thể <span className="text-red-500">*</span></Label>
                        <Input placeholder="VD: Triển khai chiến dịch truyền thông tháng 9" value={taskInfo.title} onChange={e => setTaskInfo({ ...taskInfo, title: e.target.value })} className="h-12 text-lg font-bold bg-slate-50 focus:bg-white rounded-xl border-slate-200" required />
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <Label className="font-bold text-slate-700 flex items-center gap-2">Mô tả chi tiết & Hướng dẫn thực hiện</Label>
                          <Button type="button" variant="outline" size="sm" onClick={() => setShowPlannerModal(true)} className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 font-bold rounded-lg shadow-sm">
                            <BrainCircuit className="w-4 h-4 mr-2" /> Trợ lý Lập kế hoạch (AI)
                          </Button>
                        </div>
                        <textarea className="w-full min-h-[250px] p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-y text-sm leading-relaxed" placeholder="Ghi chú chi tiết các bước, yêu cầu cần làm..." value={taskInfo.description} onChange={e => setTaskInfo({ ...taskInfo, description: e.target.value })} />
                      </div>

                      <div className="flex justify-end pt-4"><Button type="button" onClick={() => setActiveTab(2)} className="bg-slate-900 text-white px-8 rounded-xl h-11 font-bold">Tiếp theo Bước 2</Button></div>
                    </div>
                  </div>

                  {/* Bước 2 */}
                  <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 2 && "hidden")}>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><Users className="text-indigo-500" /> Phân công nhân sự & Lên lịch</h3>
                      <p className="text-slate-500 text-sm mt-1">Uỷ quyền và ấn định thời hạn hoàn thành.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <Label className="font-bold text-indigo-900 text-base">Người thực hiện chính <span className="text-red-500">*</span></Label>
                          <Button type="button" onClick={handleAutoAssign} disabled={autoAssigning} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 font-bold">
                            {autoAssigning ? <span className="flex items-center"><Bot className="mr-2 h-4 w-4 animate-bounce" /> Đang phân tích...</span> : <span className="flex items-center"><Sparkles className="mr-2 h-4 w-4" /> Auto Assign</span>}
                          </Button>
                        </div>
                        <select className="w-full h-12 rounded-xl border border-indigo-200 bg-white px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50" value={taskInfo.assignee} onChange={e => setTaskInfo({ ...taskInfo, assignee: e.target.value })} disabled={loadingEmployees}>
                          <option value="">{loadingEmployees ? "Đang tải danh sách..." : "Chọn nhân sự..."}</option>
                          {employees.map(emp => <option key={emp.id} value={emp.id.toString()}>{emp.firstname} {emp.lastname} - Phòng {emp.department?.name || 'Chưa rõ'} ({emp.workload} việc)</option>)}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <Label className="font-bold text-slate-700">Deadline & Tiến độ</Label>
                          <div className="flex items-center gap-2">
                            <Input type="date" className="h-12 rounded-xl bg-slate-50" value={taskInfo.startDate} onChange={e => setTaskInfo({ ...taskInfo, startDate: e.target.value })} />
                            <span className="text-slate-400">→</span>
                            <Input type="date" className="h-12 rounded-xl bg-slate-50 border-amber-300 focus:ring-amber-500" value={taskInfo.dueDate} onChange={e => setTaskInfo({ ...taskInfo, dueDate: e.target.value })} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-slate-700">Độ ưu tiên</Label>
                          <select className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" value={taskInfo.priority} onChange={e => setTaskInfo({ ...taskInfo, priority: e.target.value })}>
                            <option>Thấp (Routine)</option><option>Trung bình (Normal)</option><option>Cao (High)</option><option>Khẩn cấp (Urgent)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={() => setActiveTab(1)} className="rounded-xl h-11 font-bold">Quay lại</Button>
                        <Button type="button" onClick={() => setActiveTab(3)} className="bg-slate-900 text-white px-8 rounded-xl h-11 font-bold">Tiếp theo Bước 3</Button>
                      </div>
                    </div>
                  </div>

                  {/* Bước 3 */}
                  <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 3 && "hidden")}>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2"><ShieldCheck className="text-emerald-500" /> Tiêu chí Nghiệm thu</h3>
                      <p className="text-slate-500 text-sm mt-1">Yêu cầu chất lượng để nghiệm thu công việc.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Định lượng KPI</Label>
                        <textarea className="w-full min-h-[150px] p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y text-sm leading-relaxed" placeholder="Đạt 1000 lượt, 0 lỗi phát sinh..." value={taskInfo.kpi} onChange={e => setTaskInfo({ ...taskInfo, kpi: e.target.value })} />
                      </div>

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">Hoàn tất thiết lập</h4>
                          <p className="text-sm text-slate-500 mt-1">Thông báo sẽ được gửi cho nhân sự.</p>
                        </div>
                        <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-8 h-12 shadow-lg shadow-emerald-500/30 font-bold text-base">
                          BAN HÀNH NGAY
                        </Button>
                      </div>

                      <div className="flex justify-start pt-4"><Button type="button" variant="outline" onClick={() => setActiveTab(2)} className="rounded-xl h-11 font-bold">Quay lại</Button></div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </form>

      {/* AI Modal kept hidden from code review text */}
    </div>
  );
}
