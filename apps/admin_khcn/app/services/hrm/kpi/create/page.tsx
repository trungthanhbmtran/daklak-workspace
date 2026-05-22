"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Save, CheckCircle2, User, Info, Calculator, Target, Trophy, TrendingUp, Presentation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export default function CreateKpiPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  // Form State
  const [info, setInfo] = useState({
    periodName: "Đánh giá Quý III/2026",
    employeeName: "",
    department: "",
  });

  // Điểm thành phần
  const [scores1, setScores1] = useState({
    phamChat: 8, // Tối đa 10
    nangLuc: 7,  // Tối đa 10
    thaiDo: 9,   // Tối đa 10
  });

  const [scores2, setScores2] = useState({
    khoiLuong: 25, // Tối đa 30
    chatLuong: 35, // Tối đa 40
  });

  // Tự động tính điểm
  const totalGroup1 = Math.min(30, (scores1.phamChat || 0) + (scores1.nangLuc || 0) + (scores1.thaiDo || 0));
  const totalGroup2 = Math.min(70, (scores2.khoiLuong || 0) + (scores2.chatLuong || 0));
  const totalScore = totalGroup1 + totalGroup2;

  // Radar Data
  const radarData = useMemo(() => [
    { subject: 'Phẩm chất', A: (scores1.phamChat / 10) * 100, fullMark: 100 },
    { subject: 'Năng lực', A: (scores1.nangLuc / 10) * 100, fullMark: 100 },
    { subject: 'Khối lượng', A: (scores2.khoiLuong / 30) * 100, fullMark: 100 },
    { subject: 'Chất lượng', A: (scores2.chatLuong / 40) * 100, fullMark: 100 },
    { subject: 'Thái độ', A: (scores1.thaiDo / 10) * 100, fullMark: 100 },
  ], [scores1, scores2]);

  // Tự động xếp loại
  const ranking = useMemo(() => {
    if (totalScore >= 90) return { label: "Xuất sắc", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: <Trophy className="w-5 h-5" /> };
    if (totalScore >= 70) return { label: "Tốt", color: "bg-blue-100 text-blue-800 border-blue-300", icon: <TrendingUp className="w-5 h-5" /> };
    if (totalScore >= 50) return { label: "Hoàn thành", color: "bg-amber-100 text-amber-800 border-amber-300", icon: <CheckCircle2 className="w-5 h-5" /> };
    return { label: "Không hoàn thành", color: "bg-red-100 text-red-800 border-red-300", icon: <AlertCircle className="w-5 h-5" /> };
  }, [totalScore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.employeeName) {
      toast.error("Vui lòng nhập tên người được đánh giá");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Đã lưu Phiếu đánh giá KPI thành công");
      router.push("/services/hrm/kpi");
    }, 1200);
  };

  const handleScoreChange = (group: 'scores1' | 'scores2', field: string, value: string) => {
    const num = Number(value);
    if (group === 'scores1') {
      setScores1(prev => ({ ...prev, [field]: num }));
    } else {
      setScores2(prev => ({ ...prev, [field]: num }));
    }
  };

  const renderSlider = (
    group: 'scores1' | 'scores2', 
    field: string, 
    value: number, 
    max: number, 
    title: string, 
    desc: string,
    colorClass: string
  ) => (
    <div className="space-y-4 p-5 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <Label className="text-base font-bold text-slate-800">{title}</Label>
          <p className="text-sm text-slate-500 mt-1">{desc}</p>
        </div>
        <div className={cn("px-4 py-2 rounded-lg font-black text-xl border-2", colorClass)}>
          {value} <span className="text-sm font-medium opacity-60">/ {max}</span>
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max={max} 
        value={value} 
        onChange={(e) => handleScoreChange(group, field, e.target.value)}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-current"
        style={{ color: 'inherit' }}
      />
      <div className="flex justify-between text-xs font-bold text-slate-400">
        <span>0đ (Yếu)</span>
        <span>{Math.round(max/2)}đ (Đạt)</span>
        <span>{max}đ (Tốt)</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900 relative">
      <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Đánh giá Năng lực (KPI)</h2>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                <Info className="w-4 h-4 text-blue-600" /> Hệ thống phân tích đa chiều (Radar UI)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
            <Button type="submit" disabled={submitting} className="rounded-xl bg-slate-900 hover:bg-slate-800 px-8 h-11 font-bold shadow-md text-white">
              <Save className="mr-2 h-4 w-4" /> LƯU ĐÁNH GIÁ
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Cột trái: Wizard & Form */}
          <div className="xl:col-span-8 flex flex-col md:flex-row gap-6">
            
            {/* Sidebar Tabs (Wizard) */}
            <div className="w-full md:w-64 flex-shrink-0">
              <Card className="rounded-2xl border-slate-200 shadow-sm sticky top-28 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-sm text-slate-500 uppercase tracking-wider">
                  Tiến trình
                </div>
                <div className="flex flex-col p-2">
                  <button type="button" onClick={() => setActiveTab(1)} className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 1 ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100")}>
                    <div className={cn("p-2 rounded-lg", activeTab === 1 ? "bg-blue-100" : "bg-slate-200")}><User className="h-4 w-4" /></div>
                    1. Thông tin chung
                  </button>
                  <button type="button" onClick={() => setActiveTab(2)} className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 2 ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100")}>
                    <div className={cn("p-2 rounded-lg", activeTab === 2 ? "bg-indigo-100" : "bg-slate-200")}><Target className="h-4 w-4" /></div>
                    2. Tiêu chí chung
                  </button>
                  <button type="button" onClick={() => setActiveTab(3)} className={cn("flex items-center gap-3 p-3 rounded-xl text-left font-semibold transition-all", activeTab === 3 ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100")}>
                    <div className={cn("p-2 rounded-lg", activeTab === 3 ? "bg-emerald-100" : "bg-slate-200")}><Presentation className="h-4 w-4" /></div>
                    3. Kết quả công việc
                  </button>
                </div>
              </Card>
            </div>

            {/* Main Form Area */}
            <div className="flex-1 min-h-[500px]">
              
              {/* Bước 1 */}
              <div className={cn("space-y-6 animate-in fade-in duration-300", activeTab !== 1 && "hidden")}>
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <User className="text-blue-600" /> Bước 1: Thông tin nhân sự
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-slate-700">Người được đánh giá <span className="text-red-500">*</span></Label>
                      <Input 
                        placeholder="Nhập tên nhân viên..."
                        value={info.employeeName} 
                        onChange={e => setInfo({...info, employeeName: e.target.value})}
                        className="h-12 text-lg font-medium border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Kỳ đánh giá</Label>
                        <Input value={info.periodName} onChange={e => setInfo({...info, periodName: e.target.value})} className="h-11 bg-slate-50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-slate-700">Phòng ban / Đơn vị</Label>
                        <Input placeholder="Phòng ban..." value={info.department} onChange={e => setInfo({...info, department: e.target.value})} className="h-11" />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button type="button" onClick={() => setActiveTab(2)} className="bg-slate-900 text-white px-8">Tiếp tục đánh giá</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bước 2 */}
              <div className={cn("space-y-6 animate-in fade-in duration-300", activeTab !== 2 && "hidden")}>
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-900">
                      <Target className="text-indigo-600" /> Bước 2: Tiêu chí chung (Phẩm chất & Năng lực)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-slate-50/30 space-y-4">
                    <div className="text-indigo-600">
                      {renderSlider('scores1', 'phamChat', scores1.phamChat, 10, '1. Phẩm chất chính trị, đạo đức', 'Chấp hành chủ trương, đường lối, đoàn kết nội bộ.', 'text-indigo-700 bg-indigo-50 border-indigo-200')}
                      {renderSlider('scores1', 'nangLuc', scores1.nangLuc, 10, '2. Năng lực chuyên môn, sáng tạo', 'Nắm vững nghiệp vụ, có sáng kiến cải tiến công việc.', 'text-indigo-700 bg-indigo-50 border-indigo-200')}
                      {renderSlider('scores1', 'thaiDo', scores1.thaiDo, 10, '3. Thái độ phục vụ, kỷ luật', 'Giao tiếp chuẩn mực, tuân thủ nội quy cơ quan.', 'text-indigo-700 bg-indigo-50 border-indigo-200')}
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab(1)}>Quay lại</Button>
                      <Button type="button" onClick={() => setActiveTab(3)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">Chấm điểm Kết quả</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bước 3 */}
              <div className={cn("space-y-6 animate-in fade-in duration-300", activeTab !== 3 && "hidden")}>
                <Card className="rounded-2xl border-slate-200 shadow-sm">
                  <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-emerald-900">
                      <Presentation className="text-emerald-600" /> Bước 3: Kết quả thực hiện nhiệm vụ
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 bg-slate-50/30 space-y-4">
                    <div className="text-emerald-600">
                      {renderSlider('scores2', 'khoiLuong', scores2.khoiLuong, 30, '4. Khối lượng, tiến độ', 'Hoàn thành khối lượng công việc được giao đúng hạn.', 'text-emerald-700 bg-emerald-50 border-emerald-200')}
                      {renderSlider('scores2', 'chatLuong', scores2.chatLuong, 40, '5. Chất lượng, hiệu quả', 'Sản phẩm đầu ra đạt chuẩn, không có sai sót lớn.', 'text-emerald-700 bg-emerald-50 border-emerald-200')}
                    </div>
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setActiveTab(2)}>Quay lại</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>

          {/* Cột phải: Bảng Radar Dashboard */}
          <div className="xl:col-span-4 space-y-6">
            <Card className="rounded-2xl border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 overflow-hidden">
              <CardHeader className="bg-slate-900 text-white pb-6 pt-6 text-center relative">
                <CardTitle className="font-black text-xl uppercase tracking-wider flex items-center justify-center gap-2">
                  <Calculator className="w-5 h-5" /> TỔNG KẾT ĐIỂM
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                
                {/* Score Number */}
                <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
                  <div className="text-6xl font-black text-slate-900 tracking-tighter">
                    {totalScore}
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-sm mt-1">/ 100 ĐIỂM</p>
                </div>

                {/* Radar Chart */}
                <div className="h-[250px] w-full p-4 bg-white relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Năng lực" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    <Target className="w-24 h-24" />
                  </div>
                </div>

                {/* Xếp loại Alert */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Mức Xếp Loại Tự Động</Label>
                  <div className={cn("p-4 rounded-xl border-2 flex items-center gap-3", ranking.color)}>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      {ranking.icon}
                    </div>
                    <div className="font-black text-lg">
                      {ranking.label}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 bg-slate-50">
                  <Button type="submit" disabled={submitting} className="w-full h-12 text-lg font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                    HOÀN TẤT ĐÁNH GIÁ
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </form>
    </div>
  );
}
