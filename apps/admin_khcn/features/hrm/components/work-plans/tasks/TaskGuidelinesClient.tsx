"use client";

import { ArrowLeft, BookOpen, FileText, CheckCircle2, ShieldCheck, Scale, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function TaskGuidelinesClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Cơ sở & Cách thức giao việc</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Căn cứ quy định, định mức và ma trận phân quyền trách nhiệm</p>
            </div>
          </div>
          <div>
            <Link href="/services/hrm/work-plans/tasks/create">
              <Button className="rounded-xl bg-blue-700 hover:bg-blue-800 font-bold px-6 shadow-md shadow-blue-200">
                <FileText className="mr-2 h-4 w-4" /> Bắt đầu Giao việc
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Các văn bản căn cứ */}
          <Card className="rounded-2xl border-slate-200 shadow-sm border-t-4 border-t-blue-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" /> Căn cứ pháp lý & Kế hoạch
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm text-slate-600">
              <p>Mọi công việc được giao phải dựa trên các căn cứ sau để đảm bảo tính chính danh và liên kết KPI:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Kế hoạch công tác Năm:</strong> Đã được ban giám đốc phê duyệt.</span>
                </li>
                <li className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Kế hoạch công tác Quý/Tháng:</strong> Chi tiết hóa từ kế hoạch năm.</span>
                </li>
                <li className="flex items-start gap-2 bg-blue-50/50 p-2 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Chỉ đạo đột xuất:</strong> Các văn bản, thông báo kết luận từ cấp trên (vd: Nghị định, Thông tư).</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Card 2: Ma trận RACI */}
          <Card className="rounded-2xl border-slate-200 shadow-sm border-t-4 border-t-indigo-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Network className="h-5 w-5 text-indigo-600" /> Ma trận trách nhiệm (RACI)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm text-slate-600 space-y-4">
              <p>Xác định rõ vai trò của từng cá nhân trong công việc theo chuẩn quản trị quốc tế:</p>
              <div className="space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">R</div>
                  <div><strong>Responsible (Người thực hiện):</strong> Trực tiếp làm công việc được giao.</div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">A</div>
                  <div><strong>Accountable (Người chịu trách nhiệm):</strong> Ký duyệt, nghiệm thu kết quả.</div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">C</div>
                  <div><strong>Consulted (Người tư vấn):</strong> Cung cấp ý kiến chuyên môn.</div>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">I</div>
                  <div><strong>Informed (Người được thông báo):</strong> Nhận báo cáo tiến độ.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Tiêu chuẩn Nghiệm thu */}
          <Card className="rounded-2xl border-slate-200 shadow-sm border-t-4 border-t-emerald-500 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" /> Tiêu chuẩn Nghiệm thu & KPI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-sm text-slate-600 space-y-4">
              <p>Công việc chỉ được xem là hoàn thành khi đáp ứng các tiêu chuẩn sau:</p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                  <span><strong>Đúng hạn (Timeline):</strong> Báo cáo kết quả trước hoặc đúng thời hạn giao trên hệ thống.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                  <span><strong>Đạt định mức (KPI):</strong> Kết quả đo lường thực tế đạt từ 100% so với mô tả KPI lúc giao việc.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                  <span><strong>Minh chứng rõ ràng:</strong> Đính kèm đầy đủ tài liệu, văn bản, hoặc hình ảnh xác nhận (Proof of Work).</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium italic text-slate-500">
                Lưu ý: Kết quả nghiệm thu này sẽ liên kết trực tiếp với Bảng đánh giá năng lực NĐ 335.
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
