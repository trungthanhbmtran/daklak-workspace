"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, FileSignature, AlignLeft, CalendarClock, Users, Bot, CheckCircle2, ShieldCheck, Sparkles, BookOpen, X, BrainCircuit, Target, ListTodo, Presentation, Zap } from "lucide-react";
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

const FRAMEWORK_TEMPLATES = {
  SMART: {
    title: "Tổ chức Hội thảo Khoa học: Chuyển đổi số Nông nghiệp 2026",
    description: `Mục tiêu thiết lập theo nguyên tắc SMART:

- [S] Specific (Cụ thể): Tổ chức Hội thảo khoa học với 500 khách mời tại Trung tâm Hội nghị Tỉnh để giới thiệu các giải pháp công nghệ mới.
- [M] Measurable (Đo lường): Đạt tỷ lệ 90% khách mời xác nhận tham dự, thu thập ít nhất 200 leads (liên hệ tiềm năng).
- [A] Achievable (Khả thi): Đã duyệt ngân sách 200 triệu, có sự cam kết phối hợp từ 3 Sở ban ngành liên quan.
- [R] Relevant (Thực tế/Liên quan): Phù hợp với chủ trương số hóa nông nghiệp của Tỉnh năm 2026.
- [T] Time-bound (Thời gian): Hoàn tất công tác chuẩn bị trước 15/10/2026 và tổ chức vào 30/10/2026.`,
    kpi: `- Số khách tham dự: >= 450 người.
- Phản hồi hài lòng: > 85% qua form khảo sát.
- Số lượng liên hệ đối tác (leads): >= 200.`,
  },
  "5W1H2C5M": {
    title: "Triển khai phần mềm Quản lý Hành chính công",
    description: `Kế hoạch tối ưu quy trình (5W1H2C5M):

1. WHO (Ai làm): Phòng CNTT phối hợp cùng đơn vị phần mềm ngoài.
2. WHAT (Làm gì): Cài đặt, cấu hình và đào tạo sử dụng Phần mềm Hành chính công V2.0.
3. WHERE (Ở đâu): Trụ sở UBND và các phường trực thuộc.
4. WHEN (Khi nào): Bắt đầu từ 01/11, Golive vào 15/12.
5. WHY (Tại sao): Tự động hóa quy trình, giảm thời gian xử lý hồ sơ từ 5 ngày xuống 2 ngày.
6. HOW (Như thế nào): Triển khai cuốn chiếu từng phòng ban, có tài liệu hướng dẫn (User Manual).

[2C - Control & Check]
- Control: Giám sát bằng báo cáo tiến độ tuần (Weekly Report).
- Check: Nghiệm thu các lỗi (Bugs) theo danh mục UAT (User Acceptance Testing).

[5M - Nguồn lực]
- Manpower: 2 Dev, 1 BA, 1 PM.
- Money: Ngân sách 500 triệu.
- Material: Server cấu hình 16 Core, 64GB RAM.
- Machine: Mạng nội bộ đã nâng cấp.
- Method: Phương pháp Agile Scrum.`,
    kpi: `- Hoàn thành đúng hạn Golive (15/12).
- Số lượng lỗi (Bugs) Critical sau Golive: 0.
- 100% chuyên viên vượt qua bài test sử dụng phần mềm.`,
  },
  SWOT: {
    title: "Phân tích và Xây dựng Chiến lược Marketing Quý 4",
    description: `Khung phân tích chiến lược (SWOT):

[S] Strengths (Điểm mạnh):
- Sản phẩm có tính độc quyền cao tại khu vực.
- Đội ngũ Sales nhiều kinh nghiệm.

[W] Weaknesses (Điểm yếu):
- Ngân sách quảng cáo (Ads) bị cắt giảm 20% so với Quý 3.
- Thương hiệu chưa được nhận diện tốt trên nền tảng TikTok.

[O] Opportunities (Cơ hội):
- Xu hướng tiêu dùng cuối năm tăng cao.
- Đối thủ cạnh tranh chính đang gặp khủng hoảng truyền thông.

[T] Threats (Thách thức):
- Thay đổi thuật toán của Facebook làm giảm Reach tự nhiên.
- Giá nguyên liệu đầu vào có xu hướng tăng.

Yêu cầu thực hiện: Dựa trên phân tích trên, lập kế hoạch chi tiết (Action Plan) để khai thác [O] và khắc phục [W].`,
    kpi: `- Bản Action Plan đầy đủ ngân sách và nhân sự thực hiện.
- Tăng trưởng doanh số: +15% so với Quý trước.`,
  },
  AGILE: {
    title: "Phát triển tính năng App Mobile (Sprint 12)",
    description: `Quản lý công việc linh hoạt (Agile Framework):

[SPRINT GOAL]
Hoàn thiện tính năng Thanh toán quét mã QR và Đăng nhập bằng Sinh trắc học (FaceID/TouchID).

[BACKLOG ITEMS]
1. Tích hợp SDK Thanh toán VNPay (Story points: 5).
2. Xây dựng luồng UI/UX màn hình quét QR (Story points: 3).
3. Code module Sinh trắc học iOS/Android (Story points: 8).
4. Viết Unit Test và kiểm thử QA (Story points: 3).

[QUY TRÌNH THỰC HIỆN]
- Daily Stand-up: 9h00 sáng mỗi ngày qua Google Meet (15 phút).
- Sprint Review & Retrospective: Chiều Thứ 6 cuối Sprint.`,
    kpi: `- Hoàn thành 100% Story points (19 points).
- Pass toàn bộ Test case của QA (Zero bug critical).
- Mã nguồn được merge thành công lên nhánh staging.`,
  },
  EISENHOWER: {
    title: "Xử lý khủng hoảng truyền thông (Ưu tiên Cao)",
    description: `Áp dụng Ma trận sắp xếp ưu tiên (Eisenhower Matrix):

Cần phân loại và giải quyết các đầu việc theo ma trận sau:

[QUARTER 1 - Do First] (Khẩn cấp & Quan trọng - Làm ngay)
- Soạn thảo thông cáo báo chí đính chính thông tin sai lệch.
- Đăng tải bài viết giải thích trên Fanpage chính thức.

[QUARTER 2 - Schedule] (Quan trọng nhưng Không khẩn cấp - Lên lịch)
- Tổ chức buổi họp báo với các đơn vị truyền thông.
- Xây dựng quy trình phản ứng rủi ro chuẩn (SOP).

[QUARTER 3 - Delegate] (Khẩn cấp nhưng Không quan trọng - Giao việc)
- Phản hồi bình luận (Comment) của người dùng trên mạng xã hội (Giao cho team CSKH).

[QUARTER 4 - Don't Do] (Không khẩn - Không quan trọng - Bỏ qua)
- Tạm dừng các chiến dịch quảng cáo PR sản phẩm mới trong tuần này.`,
    kpi: `- Đăng thông cáo báo chí trong vòng 4 giờ kể từ khi nhận việc.
- Kiểm soát và giảm 90% lượng bình luận tiêu cực trong vòng 48 giờ.`,
  }
};

export default function CreateTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [autoAssigning, setAutoAssigning] = useState(false);
  
  // State for AI Planner Modal
  const [showPlannerModal, setShowPlannerModal] = useState(false);

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

  const [employees, setEmployees] = useState<(HrmEmployee & { workload: number })[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [plans, setPlans] = useState<HrmMasterPlan[]>([]);

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
      if (res.data.length > 0 && taskInfo.basis === "Kế hoạch Quý III/2026") {
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
    // Giả lập AI chạy trong 1.5s
    setTimeout(() => {
      setAutoAssigning(false);
      const bestMatch = employees[0]; // Nhân viên ở đầu danh sách (ít việc nhất)
      setTaskInfo({ ...taskInfo, assignee: bestMatch.id.toString() });
      toast.success(`AI đã đề xuất: ${bestMatch.firstname} ${bestMatch.lastname} (${bestMatch.workload} công việc đang xử lý)!`);
    }, 1500);
  };

  const applyFrameworkTemplate = (type: keyof typeof FRAMEWORK_TEMPLATES) => {
    const template = FRAMEWORK_TEMPLATES[type];
    setTaskInfo({
      ...taskInfo,
      title: template.title,
      description: template.description,
      kpi: template.kpi
    });
    setShowPlannerModal(false);
    toast.success(`Đã nạp mẫu kế hoạch ${type} thành công!`);
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
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900 relative">
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
                        {plans.length === 0 ? (
                          <option value="">Đang tải hoặc chưa có kế hoạch...</option>
                        ) : (
                          plans.map(p => (
                            <option key={p.id} value={p.id.toString()}>{p.title}</option>
                          ))
                        )}
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <Label className="font-bold text-slate-700 flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-slate-400" /> Mô tả chi tiết & Hướng dẫn thực hiện
                        </Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowPlannerModal(true)}
                          className="text-purple-700 border-purple-200 bg-purple-50 hover:bg-purple-100 font-bold shadow-sm"
                        >
                          <BrainCircuit className="w-4 h-4 mr-2" /> Trợ lý Lập kế hoạch (AI)
                        </Button>
                      </div>
                      <textarea
                        className="w-full min-h-[250px] p-4 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none resize-y text-sm leading-relaxed"
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
                      <select
                        className="w-full h-12 rounded-lg border border-indigo-200 bg-white px-3 text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50"
                        value={taskInfo.assignee}
                        onChange={e => setTaskInfo({ ...taskInfo, assignee: e.target.value })}
                        disabled={loadingEmployees}
                      >
                        <option value="">{loadingEmployees ? "Đang tải danh sách..." : "Chọn nhân sự..."}</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id.toString()}>
                            {emp.firstname} {emp.lastname} - Phòng {emp.department?.name || 'Chưa rõ'} ({emp.workload} việc đang chờ)
                          </option>
                        ))}
                      </select>
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
                        className="w-full min-h-[150px] p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none resize-y text-sm leading-relaxed"
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

      {/* AI Planner Modal */}
      {showPlannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BrainCircuit className="text-purple-600 w-5 h-5" /> Trợ lý Lập kế hoạch (AI Planner)
              </h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowPlannerModal(false)} className="rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6">
              <p className="text-slate-500 text-sm mb-6">Chọn một khung quản trị (Framework) phù hợp dưới đây. Hệ thống AI sẽ tự động điền cấu trúc và dữ liệu mẫu thực tế vào form để bạn dễ dàng biên tập.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="p-5 border-2 border-slate-100 hover:border-purple-300 hover:shadow-md rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-all group"
                  onClick={() => applyFrameworkTemplate('SMART')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl group-hover:bg-purple-200 group-hover:text-purple-800"><Target className="w-5 h-5" /></div>
                    <h4 className="font-bold text-slate-800 group-hover:text-purple-900">Mô hình SMART</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Phù hợp tổ chức sự kiện, hội thảo. Thiết lập mục tiêu Cụ thể, Đo lường được, Khả thi, Thực tế và Có thời hạn.</p>
                </div>

                <div 
                  className="p-5 border-2 border-slate-100 hover:border-purple-300 hover:shadow-md rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-all group"
                  onClick={() => applyFrameworkTemplate('5W1H2C5M')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl group-hover:bg-purple-200 group-hover:text-purple-800"><ListTodo className="w-5 h-5" /></div>
                    <h4 className="font-bold text-slate-800 group-hover:text-purple-900">Mô hình 5W1H2C5M</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Dùng tối ưu quy trình phức tạp, triển khai phần mềm (Who, What, Where, When, Why, How, Check, Control...)</p>
                </div>

                <div 
                  className="p-5 border-2 border-slate-100 hover:border-purple-300 hover:shadow-md rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-all group"
                  onClick={() => applyFrameworkTemplate('SWOT')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl group-hover:bg-purple-200 group-hover:text-purple-800"><Presentation className="w-5 h-5" /></div>
                    <h4 className="font-bold text-slate-800 group-hover:text-purple-900">Phân tích SWOT</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Dành cho kế hoạch Marketing, Chiến lược thông qua Điểm mạnh, Yếu, Cơ hội, Thách thức.</p>
                </div>

                <div 
                  className="p-5 border-2 border-slate-100 hover:border-purple-300 hover:shadow-md rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-all group"
                  onClick={() => applyFrameworkTemplate('AGILE')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl group-hover:bg-purple-200 group-hover:text-purple-800"><Zap className="w-5 h-5" /></div>
                    <h4 className="font-bold text-slate-800 group-hover:text-purple-900">Khung linh hoạt Agile</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Phù hợp phát triển App, IT. Quản lý linh hoạt theo Sprint, Daily Stand-up, Backlog.</p>
                </div>

                <div 
                  className="p-5 border-2 border-slate-100 hover:border-purple-300 hover:shadow-md rounded-2xl cursor-pointer bg-white hover:bg-purple-50 transition-all group md:col-span-2"
                  onClick={() => applyFrameworkTemplate('EISENHOWER')}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl group-hover:bg-purple-200 group-hover:text-purple-800"><AlignLeft className="w-5 h-5" /></div>
                    <h4 className="font-bold text-slate-800 group-hover:text-purple-900">Ma trận Eisenhower</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">Sắp xếp mức độ Khẩn cấp và Quan trọng để xử lý khủng hoảng, phân loại công việc cần uỷ quyền hay làm ngay.</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 flex justify-end border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setShowPlannerModal(false)} className="font-bold text-slate-600">Đóng lại</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
