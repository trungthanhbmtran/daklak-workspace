"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Save, Briefcase, Calendar, User, FileText, CheckCircle2, Clock, Upload, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [taskInfo, setTaskInfo] = useState({
    title: "",
    assignee: "",
    reviewer: "",
    startDate: "",
    dueDate: "",
    priority: "Trung bình",
    description: "",
    kpi: "",
  });

  const [resultInfo, setResultInfo] = useState({
    status: "Đang làm",
    actualDate: "",
    resultReport: "",
  });

  const [evaluation, setEvaluation] = useState({
    score: "",
    comments: "",
  });

  // Tự động xếp loại
  const ranking = useMemo(() => {
    const score = Number(evaluation.score) || 0;
    if (evaluation.score === "") return { label: "Chưa đánh giá", color: "bg-slate-100 text-slate-500 border-slate-200" };
    if (score >= 90) return { label: "Hoàn thành xuất sắc", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (score >= 70) return { label: "Hoàn thành tốt", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (score >= 50) return { label: "Hoàn thành nhiệm vụ", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Không hoàn thành", color: "bg-red-100 text-red-800 border-red-300" };
  }, [evaluation.score]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInfo.title || !taskInfo.assignee) {
      toast.error("Vui lòng nhập Tiêu đề và Người thực hiện");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Đã lưu thông tin công việc thành công");
      router.push("/services/hrm/tasks");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Giao việc & Đánh giá</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Quản lý vòng đời công việc từ lúc giao đến khi nghiệm thu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-blue-700 hover:bg-blue-800 px-8 h-11 font-bold shadow-lg shadow-blue-200">
              <Save className="mr-2 h-4 w-4" /> LƯU THÔNG TIN
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cột trái: Giao việc & Báo cáo */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Phần 1: Giao việc */}
            <Card className="rounded-2xl border-slate-300 shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-700" /> Phần 1: Thông tin giao việc (Quản lý)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Tên công việc / Nhiệm vụ <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VD: Lập báo cáo tổng kết tháng"
                    value={taskInfo.title} 
                    onChange={e => setTaskInfo({...taskInfo, title: e.target.value})}
                    className="text-lg font-semibold"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-1"><User className="w-4 h-4" /> Người thực hiện <span className="text-red-500">*</span></Label>
                    <Input 
                      placeholder="Chọn nhân sự..."
                      value={taskInfo.assignee} 
                      onChange={e => setTaskInfo({...taskInfo, assignee: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-1"><User className="w-4 h-4" /> Người theo dõi/Kiểm duyệt</Label>
                    <Input 
                      placeholder="Chọn người quản lý..."
                      value={taskInfo.reviewer} 
                      onChange={e => setTaskInfo({...taskInfo, reviewer: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-1"><Calendar className="w-4 h-4" /> Thời gian thực hiện</Label>
                    <div className="flex items-center gap-2">
                      <Input type="date" value={taskInfo.startDate} onChange={e => setTaskInfo({...taskInfo, startDate: e.target.value})} />
                      <span className="text-slate-400">-</span>
                      <Input type="date" value={taskInfo.dueDate} onChange={e => setTaskInfo({...taskInfo, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Độ ưu tiên</Label>
                    <select
                      className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      value={taskInfo.priority}
                      onChange={e => setTaskInfo({...taskInfo, priority: e.target.value})}
                    >
                      <option>Thấp</option>
                      <option>Trung bình</option>
                      <option>Cao</option>
                      <option>Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Mô tả chi tiết nội dung công việc</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm"
                    placeholder="Mô tả các bước thực hiện..."
                    value={taskInfo.description}
                    onChange={e => setTaskInfo({...taskInfo, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <Label className="font-bold text-blue-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Yêu cầu kết quả / KPI (Định mức)
                  </Label>
                  <textarea 
                    className="w-full min-h-[80px] p-3 rounded-md border border-blue-200 bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm"
                    placeholder="Định lượng kết quả cần đạt. VD: Hoàn thành 100% đúng hạn..."
                    value={taskInfo.kpi}
                    onChange={e => setTaskInfo({...taskInfo, kpi: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Phần 2: Báo cáo thực hiện */}
            <Card className="rounded-2xl border-slate-300 shadow-sm border-t-4 border-t-amber-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" /> Phần 2: Báo cáo kết quả (Nhân viên)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-1"><Clock className="w-4 h-4" /> Trạng thái hiện tại</Label>
                    <select
                      className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                      value={resultInfo.status}
                      onChange={e => setResultInfo({...resultInfo, status: e.target.value})}
                    >
                      <option>Chưa bắt đầu</option>
                      <option>Đang làm</option>
                      <option>Tạm dừng</option>
                      <option>Đã hoàn thành</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700 flex items-center gap-1"><Calendar className="w-4 h-4" /> Ngày hoàn thành thực tế</Label>
                    <Input type="date" value={resultInfo.actualDate} onChange={e => setResultInfo({...resultInfo, actualDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Báo cáo chi tiết kết quả đạt được</Label>
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm"
                    placeholder="Trình bày kết quả công việc đã thực hiện..."
                    value={resultInfo.resultReport}
                    onChange={e => setResultInfo({...resultInfo, resultReport: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700 flex items-center gap-2"><Upload className="w-4 h-4" /> Tài liệu/Minh chứng đính kèm</Label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Kéo thả file vào đây hoặc click để tải lên</span>
                    <span className="text-xs text-slate-400">Hỗ trợ PDF, DOCX, XLSX (Max 10MB)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Cột phải: Đánh giá & Nghiệm thu */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-300 shadow-md sticky top-28 border-t-4 border-t-emerald-500">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-6">
                <CardTitle className="text-center font-bold text-xl flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> PHẦN 3: ĐÁNH GIÁ (QUẢN LÝ)
                </CardTitle>
                <p className="text-center text-xs text-slate-400 mt-2">Dùng để tính KPI theo NĐ 335/2025</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white rounded-b-xl">
                
                <div className="space-y-3">
                  <Label className="font-black text-slate-800 text-sm uppercase tracking-wider">Điểm đánh giá (0-100)</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      min="0" max="100" 
                      className="text-3xl font-black h-16 text-center text-blue-700 bg-blue-50 border-blue-200" 
                      value={evaluation.score} 
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setEvaluation({...evaluation, score: e.target.value === '' ? '' : val.toString()})
                      }} 
                      placeholder="0"
                    />
                    <span className="text-xl font-bold text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Mức độ hoàn thành</Label>
                  <div className={cn("p-3 rounded-lg border-2 text-center font-bold", ranking.color)}>
                    {ranking.label}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Nhận xét của Quản lý</Label>
                  <textarea 
                    className="w-full min-h-[120px] p-3 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y text-sm"
                    placeholder="Nhập đánh giá, nhận xét về tiến độ, chất lượng..."
                    value={evaluation.comments}
                    onChange={e => setEvaluation({...evaluation, comments: e.target.value})}
                  />
                </div>

                <div className="bg-amber-50 p-4 rounded-xl text-xs text-amber-700 font-medium border border-amber-200">
                  <strong>Lưu ý:</strong> Kết quả điểm số này sẽ được tự động đồng bộ vào Bảng đánh giá KPI cá nhân trong tháng/quý tương ứng.
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
