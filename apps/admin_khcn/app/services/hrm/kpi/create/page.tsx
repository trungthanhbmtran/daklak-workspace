"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Save, FileText, CheckCircle2, User, Info, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateKpiPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [info, setInfo] = useState({
    periodName: "Đánh giá Quý III/2026",
    employeeName: "",
    department: "",
  });

  // Điểm thành phần
  // Nhóm 1: Tiêu chí chung (Tối đa 30 điểm)
  const [scores1, setScores1] = useState({
    phamChat: 0, // Tối đa 10
    nangLuc: 0,  // Tối đa 10
    thaiDo: 0,   // Tối đa 10
  });

  // Nhóm 2: Kết quả công việc (Tối đa 70 điểm)
  const [scores2, setScores2] = useState({
    khoiLuong: 0, // Tối đa 30
    chatLuong: 0, // Tối đa 40
  });

  // Tự động tính điểm
  const totalGroup1 = Math.min(30, (scores1.phamChat || 0) + (scores1.nangLuc || 0) + (scores1.thaiDo || 0));
  const totalGroup2 = Math.min(70, (scores2.khoiLuong || 0) + (scores2.chatLuong || 0));
  const totalScore = totalGroup1 + totalGroup2;

  // Tự động xếp loại
  const ranking = useMemo(() => {
    if (totalScore >= 90) return { label: "Hoàn thành xuất sắc nhiệm vụ", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (totalScore >= 70) return { label: "Hoàn thành tốt nhiệm vụ", color: "bg-blue-100 text-blue-800 border-blue-300" };
    if (totalScore >= 50) return { label: "Hoàn thành nhiệm vụ", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { label: "Không hoàn thành nhiệm vụ", color: "bg-red-100 text-red-800 border-red-300" };
  }, [totalScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.employeeName) {
      toast.error("Vui lòng nhập tên người được đánh giá");
      return;
    }
    setSubmitting(true);
    // Giả lập API
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Đã lưu Phiếu đánh giá KPI thành công");
      router.push("/services/hrm/kpi");
    }, 1000);
  };

  const handleScoreChange = (group: 'scores1' | 'scores2', field: string, value: string, max: number) => {
    const num = Math.min(max, Math.max(0, Number(value) || 0));
    if (group === 'scores1') {
      setScores1(prev => ({ ...prev, [field]: num }));
    } else {
      setScores2(prev => ({ ...prev, [field]: num }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <form onSubmit={handleSubmit} className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Phiếu đánh giá KPI</h2>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                <Info className="h-4 w-4 text-blue-600" />
                Tuân thủ Nghị định 335/2025/NĐ-CP của Chính phủ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-blue-700 hover:bg-blue-800 px-8 h-11 font-bold shadow-lg shadow-blue-200">
              <Save className="mr-2 h-4 w-4" /> LƯU ĐÁNH GIÁ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Cột trái: Thông tin & Điểm */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Thông tin chung */}
            <Card className="rounded-2xl border-slate-300 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-700" /> Thông tin đánh giá
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Kỳ đánh giá</Label>
                  <Input 
                    value={info.periodName} 
                    onChange={e => setInfo({...info, periodName: e.target.value})}
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Người được đánh giá <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="VD: Nguyễn Văn A"
                    value={info.employeeName} 
                    onChange={e => setInfo({...info, employeeName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-bold text-slate-700">Phòng ban / Đơn vị</Label>
                  <Input 
                    placeholder="VD: Phòng Hành chính Tổng hợp"
                    value={info.department} 
                    onChange={e => setInfo({...info, department: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Nhóm 1 */}
            <Card className="rounded-2xl border-slate-300 shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">1. Tiêu chí chung</CardTitle>
                  <p className="text-sm text-slate-500 font-medium">Đánh giá phẩm chất, năng lực và thái độ</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full font-bold text-lg">
                  {totalGroup1} / 30
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-800">Phẩm chất chính trị, đạo đức, lối sống</Label>
                    <p className="text-sm text-slate-500">Chấp hành chủ trương, đường lối, giữ gìn đoàn kết.</p>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input type="number" min="0" max="10" className="text-right font-bold text-lg" value={scores1.phamChat || ''} onChange={(e) => handleScoreChange('scores1', 'phamChat', e.target.value, 10)} />
                    <span className="text-slate-500 font-medium whitespace-nowrap">/ 10</span>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-800">Năng lực chuyên môn, đổi mới sáng tạo</Label>
                    <p className="text-sm text-slate-500">Nắm vững nghiệp vụ, có sáng kiến cải tiến công việc.</p>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input type="number" min="0" max="10" className="text-right font-bold text-lg" value={scores1.nangLuc || ''} onChange={(e) => handleScoreChange('scores1', 'nangLuc', e.target.value, 10)} />
                    <span className="text-slate-500 font-medium whitespace-nowrap">/ 10</span>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-800">Thái độ phục vụ Nhân dân, ý thức kỷ luật</Label>
                    <p className="text-sm text-slate-500">Giao tiếp chuẩn mực, tuân thủ nội quy cơ quan.</p>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input type="number" min="0" max="10" className="text-right font-bold text-lg" value={scores1.thaiDo || ''} onChange={(e) => handleScoreChange('scores1', 'thaiDo', e.target.value, 10)} />
                    <span className="text-slate-500 font-medium whitespace-nowrap">/ 10</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Nhóm 2 */}
            <Card className="rounded-2xl border-slate-300 shadow-sm border-t-4 border-t-emerald-500">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">2. Kết quả thực hiện nhiệm vụ</CardTitle>
                  <p className="text-sm text-slate-500 font-medium">Đánh giá theo KPI và công việc được giao</p>
                </div>
                <div className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-lg">
                  {totalGroup2} / 70
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-800">Khối lượng, tiến độ công việc</Label>
                    <p className="text-sm text-slate-500">Hoàn thành đúng hạn, đảm bảo định mức công việc.</p>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input type="number" min="0" max="30" className="text-right font-bold text-lg" value={scores2.khoiLuong || ''} onChange={(e) => handleScoreChange('scores2', 'khoiLuong', e.target.value, 30)} />
                    <span className="text-slate-500 font-medium whitespace-nowrap">/ 30</span>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-slate-800">Chất lượng, hiệu quả công việc</Label>
                    <p className="text-sm text-slate-500">Sản phẩm công việc đạt yêu cầu, không có sai sót lớn.</p>
                  </div>
                  <div className="w-32 flex items-center gap-2">
                    <Input type="number" min="0" max="40" className="text-right font-bold text-lg" value={scores2.chatLuong || ''} onChange={(e) => handleScoreChange('scores2', 'chatLuong', e.target.value, 40)} />
                    <span className="text-slate-500 font-medium whitespace-nowrap">/ 40</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Cột phải: Tổng điểm & Kết luận */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-300 shadow-md sticky top-6">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl pb-6">
                <CardTitle className="text-center font-bold text-xl flex items-center justify-center gap-2">
                  <Calculator className="h-5 w-5" /> TỔNG KẾT ĐIỂM
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white rounded-b-xl">
                
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Tổng điểm đạt được</p>
                  <div className="text-7xl font-black text-slate-900 tracking-tighter">
                    {totalScore}
                  </div>
                  <p className="text-slate-400 font-medium">/ 100 điểm</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Mức xếp loại tự động (Điều 12, NĐ 335)</Label>
                  <div className={cn("p-4 rounded-xl border-2 text-center font-bold text-lg", ranking.color)}>
                    {ranking.label}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 font-medium space-y-2 border border-slate-200">
                  <div className="flex justify-between"><span>Xuất sắc:</span> <span>90 - 100đ</span></div>
                  <div className="flex justify-between"><span>Tốt:</span> <span>70 - 89đ</span></div>
                  <div className="flex justify-between"><span>Hoàn thành:</span> <span>50 - 69đ</span></div>
                  <div className="flex justify-between"><span>Không hoàn thành:</span> <span>&lt; 50đ</span></div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
