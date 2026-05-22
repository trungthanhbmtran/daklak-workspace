"use client";

import { useState } from "react";
import { ArrowLeft, Save, FileSignature, AlignLeft, CalendarClock, Users, Bot, CheckCircle2, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CreateTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [autoAssigning, setAutoAssigning] = useState(false);

  // Form State
  const [taskInfo, setTaskInfo] = useState({
    basis: "Kế hoạch Quý III/2026",
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

  const handleAutoAssign = () => {
    setAutoAssigning(true);
    // Giả lập AI chạy trong 1.5s
    setTimeout(() => {
      setAutoAssigning(false);
      setTaskInfo({ ...taskInfo, assignee: "Nguyễn Văn A (Rảnh 30% thời gian)" });
      toast.success("AI đã phân tích và đề xuất nhân sự phù hợp nhất!");
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInfo.title || !taskInfo.assignee) {
      toast.error("Vui lòng nhập đầy đủ Tiêu đề và Người thực hiện");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Đã khởi tạo phân việc thành công");
      router.push("/services/hrm/tasks");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Khởi tạo Phân việc Mới</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Hệ thống phân việc và kiểm soát luồng công việc tự động</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/services/hrm/tasks/guidelines">
              <Button type="button" variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 font-bold hidden md:flex">
                <BookOpen className="mr-2 h-4 w-4" /> Cơ sở & Hướng dẫn
              </Button>
            </Link>
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-8 h-11 font-bold shadow-md">
              <Save className="mr-2 h-4 w-4" /> BAN HÀNH CÔNG VIỆC
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar Tabs (Wizard) */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="rounded-2xl border-slate-200 shadow-sm sticky top-28 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-500 uppercase tracking-wider">
                Quy trình thiết lập
              </div>
              <div className="flex flex-col p-2">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 1 ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100")}
                >
                  <div className={cn("p-2 rounded-lg", activeTab === 1 ? "bg-blue-100" : "bg-slate-200")}><FileSignature className="h-4 w-4" /></div>
                  1. Cơ sở & Nội dung
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 2 ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100")}
                >
                  <div className={cn("p-2 rounded-lg", activeTab === 2 ? "bg-indigo-100" : "bg-slate-200")}><Users className="h-4 w-4" /></div>
                  2. Phân công nhân sự
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(3)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 3 ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100")}
                >
                  <div className={cn("p-2 rounded-lg", activeTab === 3 ? "bg-emerald-100" : "bg-slate-200")}><ShieldCheck className="h-4 w-4" /></div>
                  3. Tiêu chí kiểm soát
                </button>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <Card className="rounded-2xl border-slate-200 shadow-sm min-h-[500px]">
              <CardContent className="p-8">

                {/* Bước 1 */}
                <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 1 && "hidden")}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileSignature className="text-blue-600" /> Bước 1: Xác định Cơ sở & Nội dung công việc
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Căn cứ để giao việc và định hình nội dung cần thực hiện.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center justify-between">
                        Cơ sở phân việc / Kế hoạch gốc
                        <Link href="/services/hrm/tasks/guidelines" className="text-blue-600 font-normal text-xs hover:underline">Xem hệ thống cơ sở</Link>
                      </Label>
                      <select
                        className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                        value={taskInfo.basis}
                        onChange={e => setTaskInfo({ ...taskInfo, basis: e.target.value })}
                      >
                        <option>Kế hoạch Năm 2026</option>
                        <option>Kế hoạch Quý III/2026</option>
                        <option>Chỉ đạo đột xuất của Lãnh đạo</option>
                        <option>Nghị quyết số 123/NQ-CP</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Tên công việc / Nhiệm vụ cụ thể <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="VD: Triển khai chiến dịch truyền thông tháng 9"
                        value={taskInfo.title}
                        onChange={e => setTaskInfo({ ...taskInfo, title: e.target.value })}
                        className="h-11 text-lg font-semibold bg-slate-50 focus:bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center gap-2"><AlignLeft className="w-4 h-4 text-slate-400" /> Mô tả chi tiết & Hướng dẫn thực hiện</Label>
                      <textarea
                        className="w-full min-h-[150px] p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm leading-relaxed"
                        placeholder="Ghi chú chi tiết các bước, yêu cầu cần làm, tài nguyên hỗ trợ..."
                        value={taskInfo.description}
                        onChange={e => setTaskInfo({ ...taskInfo, description: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="button" onClick={() => setActiveTab(2)} className="bg-slate-900 text-white px-6">Tiếp theo Bước 2</Button>
                    </div>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 2 && "hidden")}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Users className="text-indigo-600" /> Bước 2: Phân công nhân sự & Lên lịch
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Ủy quyền công việc và thiết lập thời gian thực hiện.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Label className="font-bold text-indigo-900 text-base">Người chịu trách nhiệm chính (Assignee) <span className="text-red-500">*</span></Label>
                        <Button
                          type="button"
                          onClick={handleAutoAssign}
                          disabled={autoAssigning}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md shadow-indigo-200"
                        >
                          {autoAssigning ? (
                            <span className="flex items-center"><Bot className="mr-2 h-4 w-4 animate-bounce" /> Đang phân tích...</span>
                          ) : (
                            <span className="flex items-center"><Sparkles className="mr-2 h-4 w-4" /> Giao việc tự động (AI)</span>
                          )}
                        </Button>
                      </div>
                      <Input
                        placeholder="Chọn hoặc để AI gợi ý..."
                        value={taskInfo.assignee}
                        onChange={e => setTaskInfo({ ...taskInfo, assignee: e.target.value })}
                        className="h-12 text-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                      />
                      <p className="text-xs text-indigo-600/70 font-medium">
                        * Tự động giao việc sẽ phân tích Lịch biểu hiện tại, Ma trận kỹ năng và Khối lượng công việc (Workload) để tìm người phù hợp.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Người phối hợp / Kiểm duyệt (Reviewer)</Label>
                      <Input
                        placeholder="Thêm người kiểm duyệt (tùy chọn)..."
                        value={taskInfo.reviewer}
                        onChange={e => setTaskInfo({ ...taskInfo, reviewer: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-slate-400" /> Deadline & Tiến độ</Label>
                        <div className="flex items-center gap-2">
                          <Input type="date" className="h-11" value={taskInfo.startDate} onChange={e => setTaskInfo({ ...taskInfo, startDate: e.target.value })} />
                          <span className="text-slate-400">đến</span>
                          <Input type="date" className="h-11 border-amber-300 focus:border-amber-500" value={taskInfo.dueDate} onChange={e => setTaskInfo({ ...taskInfo, dueDate: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Độ ưu tiên</Label>
                        <select
                          className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                          value={taskInfo.priority}
                          onChange={e => setTaskInfo({ ...taskInfo, priority: e.target.value })}
                        >
                          <option>Thấp (Routine)</option>
                          <option>Trung bình (Normal)</option>
                          <option>Cao (High)</option>
                          <option>Khẩn cấp (Urgent - Báo động đỏ)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab(1)}>Quay lại</Button>
                      <Button type="button" onClick={() => setActiveTab(3)} className="bg-slate-900 text-white px-6">Tiếp theo Bước 3</Button>
                    </div>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className={cn("space-y-8 animate-in fade-in slide-in-from-right-4 duration-300", activeTab !== 3 && "hidden")}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="text-emerald-600" /> Bước 3: Tiêu chí kiểm soát & Nghiệm thu
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">Định mức chất lượng làm cơ sở đánh giá khi công việc hoàn tất.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Yêu cầu kết quả đầu ra (Định lượng KPI)
                      </Label>
                      <textarea
                        className="w-full min-h-[120px] p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y text-sm leading-relaxed"
                        placeholder="Ví dụ: Đạt 1000 lượt tương tác, Xử lý xong 50 hồ sơ, Không có lỗi phát sinh..."
                        value={taskInfo.kpi}
                        onChange={e => setTaskInfo({ ...taskInfo, kpi: e.target.value })}
                      />
                      <p className="text-xs text-slate-500">* Căn cứ này sẽ được dùng cho Form Đánh giá sau khi nhiệm vụ hoàn tất.</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Chu kỳ báo cáo tiến độ (Control frequency)</Label>
                      <select
                        className="w-full md:w-1/2 h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                        value={taskInfo.reportFrequency}
                        onChange={e => setTaskInfo({ ...taskInfo, reportFrequency: e.target.value })}
                      >
                        <option>Không yêu cầu báo cáo giữa kỳ</option>
                        <option>Hàng ngày (Daily Check-in)</option>
                        <option>Hàng tuần (Weekly Report)</option>
                        <option>Khi đạt 50% khối lượng</option>
                      </select>
                    </div>

                    <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 mt-6 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Save className="w-5 h-5 text-slate-600" />
                      </div>
                      <h4 className="font-bold text-slate-800">Hoàn tất thiết lập Phân việc</h4>
                      <p className="text-sm text-slate-500 max-w-sm">Hệ thống sẽ gửi thông báo (Notification/Email) ngay lập tức đến người được giao việc sau khi bạn nhấn Ban hành.</p>
                      <Button type="submit" disabled={submitting} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 shadow-lg shadow-emerald-200 font-bold">
                        BAN HÀNH CÔNG VIỆC NÀY
                      </Button>
                    </div>

                    <div className="flex justify-start pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab(2)}>Quay lại</Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
