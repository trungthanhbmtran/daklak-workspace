"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft, Save, Info, Target, Settings2,
  Layers, Plus, Trash2, ShieldAlert, CheckCircle2,
  Compass, BarChart3, HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
type FrameworkMode = "MBO_KPI" | "OKRS";

interface TargetItem {
  id: string;
  title: string;
  parentGoal: string; // Liên kết mục tiêu cấp Sở/Cơ quan
  weightOrConfidence: number; // Trọng số (%) đối với KPI, hoặc Độ tự tin (1-10) đối với OKR
  targetValue: number;
  unit: string;
}

export function CreateKpiClient() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [framework, setFramework] = useState<FrameworkMode>("MBO_KPI");

  // Thông tin chung của kế hoạch ban hành
  const [planInfo, setPlanInfo] = useState({
    title: "Kế hoạch Thực hiện Nhiệm vụ Quý III/2026",
    department: "Trung tâm Điều hành Đô thị Thông minh (IOC)",
    owner: "Nguyễn Văn Đắk",
  });

  // Danh sách chỉ tiêu/Mục tiêu khởi tạo sẵn
  const [targets, setTargets] = useState<TargetItem[]>([
    { id: "t-1", title: "Đảm bảo uptime hệ thống Trục liên thông dữ liệu LGSP", parentGoal: "Số hóa hạ tầng dữ liệu dùng chung toàn tỉnh", weightOrConfidence: 40, targetValue: 99.9, unit: "%" },
    { id: "t-2", title: "Phát triển phân hệ Microservices gRPC kết nối API camera giám sát", parentGoal: "Nâng cao năng lực giám sát điều hành IOC", weightOrConfidence: 35, targetValue: 12, unit: "API" },
    { id: "t-3", title: "Triển khai hạ tầng ảo hóa tối ưu cụm Kubernetes (K8s)", parentGoal: "Số hóa hạ tầng dữ liệu dùng chung toàn tỉnh", weightOrConfidence: 25, targetValue: 100, unit: "%" },
  ]);

  // State cho dòng nhập liệu mới
  const [newTitle, setNewTitle] = useState("");
  const [newParent, setNewParent] = useState("Số hóa hạ tầng dữ liệu dùng chung toàn tỉnh");
  const [newMetric, setNewMetric] = useState(framework === "MBO_KPI" ? 20 : 7); // Trọng số hoặc Độ tự tin
  const [newTargetVal, setNewTargetVal] = useState(0);
  const [newUnit, setNewUnit] = useState("%");

  // --- LOGIC TÍNH TOÁN THEO MÔ HÌNH QUẢN TRỊ ---
  const totalWeight = useMemo(() => {
    if (framework !== "MBO_KPI") return 0;
    return targets.reduce((sum, item) => sum + item.weightOrConfidence, 0);
  }, [targets, framework]);

  const avgConfidence = useMemo(() => {
    if (framework !== "OKRS") return 0;
    if (targets.length === 0) return 0;
    return Number((targets.reduce((sum, item) => sum + item.weightOrConfidence, 0) / targets.length).toFixed(1));
  }, [targets, framework]);

  // Dữ liệu Radar Map động dựa theo danh sách mục tiêu
  const radarData = useMemo(() => {
    return targets.map(t => ({
      subject: t.title.length > 20 ? t.title.substring(0, 20) + "..." : t.title,
      A: framework === "MBO_KPI" ? t.weightOrConfidence : (t.weightOrConfidence * 10),
      fullMark: 100
    }));
  }, [targets, framework]);

  // Trạng thái hợp lệ của biểu đồ kế hoạch đầu kỳ
  const isPlanValid = useMemo(() => {
    if (framework === "MBO_KPI") return totalWeight === 100;
    return targets.length > 0;
  }, [totalWeight, targets, framework]);

  // --- XỬ LÝ SỰ KIỆN ---
  const handleAddTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TargetItem = {
      id: crypto.randomUUID(),
      title: newTitle,
      parentGoal: newParent,
      weightOrConfidence: Number(newMetric),
      targetValue: Number(newTargetVal),
      unit: newUnit
    };

    setTargets([...targets, newItem]);
    setNewTitle("");
    setNewTargetVal(0);
  };

  const handleDeleteTarget = (id: string) => {
    setTargets(targets.filter(t => t.id !== id));
  };

  const handlePublish = async () => {
    if (framework === "MBO_KPI" && totalWeight !== 100) {
      toast.error("Không thể ban hành: Tổng trọng số các chỉ tiêu phải bằng chính xác 100%");
      return;
    }
    if (targets.length === 0) {
      toast.error("Vui lòng thiết lập ít nhất một mục tiêu trước khi ban hành");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Ban hành kế hoạch theo chuẩn ${framework === "MBO_KPI" ? "KPI/MBO" : "OKRs"} thành công!`);
      router.push("/services/hrm/kpi");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 text-slate-900">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Sticky Header Điều hướng & Hành động */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Thiết lập & Ban hành Kế hoạch Đầu kỳ</h2>
              <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                <Settings2 className="w-4 h-4 text-indigo-600" /> Hệ thống hoạch định cấu hình động tùy biến theo mô hình quản trị
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl border flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setFramework("MBO_KPI"); setTargets([]); }}
                className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", framework === "MBO_KPI" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                MÔ HÌNH KPI (MBO)
              </button>
              <button
                type="button"
                onClick={() => { setFramework("OKRS"); setTargets([]); }}
                className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all", framework === "OKRS" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900")}
              >
                MÔ HÌNH OKRs
              </button>
            </div>
            <Button onClick={handlePublish} disabled={submitting} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-11 font-bold shadow-md">
              <Save className="mr-2 h-4 w-4" /> BAN HÀNH KẾ HOẠCH
            </Button>
          </div>
        </div>

        {/* Cấu trúc lưới Layout chính */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* CỘT TRÁI: KHỞI TẠO VÀ PHÂN RÃ CHỈ TIÊU (8/12) */}
          <div className="xl:col-span-8 space-y-6">

            {/* Thẻ thông tin chung */}
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Layers className="text-slate-700" /> Cấu hình thông tin thực hiện
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 text-xs uppercase">Tên kế hoạch hành động</Label>
                  <Input value={planInfo.title} onChange={e => setPlanInfo({ ...planInfo, title: e.target.value })} className="h-10 border-slate-200 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 text-xs uppercase">Đơn vị chịu trách nhiệm</Label>
                  <Input value={planInfo.department} disabled className="h-10 bg-slate-50 border-slate-200 font-medium text-slate-500" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold text-slate-700 text-xs uppercase">Nhân sự thực hiện</Label>
                  <Input value={planInfo.owner} onChange={e => setPlanInfo({ ...planInfo, owner: e.target.value })} className="h-10 border-slate-200 font-medium" />
                </div>
              </CardContent>
            </Card>

            {/* Form thêm mới nhanh chỉ tiêu mục tiêu */}
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b bg-slate-50/20">
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  {framework === "MBO_KPI" ? "Khởi tạo Chỉ số hiệu suất (KPI)" : "Thiết lập Kết quả Then chốt (Key Result)"}
                </CardTitle>
                <CardDescription>Liên kết các chỉ tiêu đo lường trực tiếp vào cây mục tiêu chung của tổ chức.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddTarget} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-4 space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Nội dung chỉ tiêu (Đo lường được)</Label>
                    <Input
                      placeholder={framework === "MBO_KPI" ? "Ví dụ: Tốc độ xử lý API..." : "Ví dụ: Hoàn thành cấu hình 12 luồng gRPC..."}
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="h-10 border-slate-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Mục tiêu chiến lược cấp trên</Label>
                    <Select value={newParent} onValueChange={setNewParent}>
                      <SelectTrigger className="h-10 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Số hóa hạ tầng dữ liệu dùng chung toàn tỉnh">Hạ tầng dữ liệu dùng chung</SelectItem>
                        <SelectItem value="Nâng cao năng lực giám sát điều hành IOC">Năng lực điều hành IOC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">
                      {framework === "MBO_KPI" ? "Trọng số (%)" : "Độ tự tin (1-10)"}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={framework === "MBO_KPI" ? 100 : 10}
                      value={newMetric}
                      onChange={e => setNewMetric(Number(e.target.value))}
                      className="h-10 border-slate-200 font-mono"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label className="font-bold text-slate-700 text-xs">Mục tiêu số / Đơn vị</Label>
                    <div className="flex gap-1">
                      <Input type="number" step="any" value={newTargetVal} onChange={e => setNewTargetVal(Number(e.target.value))} className="h-10 border-slate-200 font-mono w-2/3" required />
                      <Input value={newUnit} onChange={e => setNewUnit(e.target.value)} className="h-10 border-slate-200 w-1/3 text-center px-1" required />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-xl">Thêm</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Bảng danh sách cấu hình chi tiết */}
            <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900">Chi tiết ma trận phân bổ đầu kỳ</h3>
                </div>
                <Badge variant="outline" className="font-mono bg-white font-bold px-3 py-1 text-slate-700 border-slate-200">
                  Mô hình: {framework === "MBO_KPI" ? "KPIs / MBO" : "OKRs Framework"}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-6 w-[45%]">Mục tiêu thực hiện</th>
                      <th className="py-3.5 px-4">Mục tiêu cha (Kế thừa)</th>
                      <th className="py-3.5 px-4 text-center">
                        {framework === "MBO_KPI" ? "Trọng số" : "Độ tự tin"}
                      </th>
                      <th className="py-3.5 px-4 text-right">Chỉ tiêu cam kết</th>
                      <th className="py-3.5 px-6 text-center w-[80px]">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {targets.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900 leading-relaxed">{item.title}</td>
                        <td className="py-4 px-4"><Badge variant="secondary" className="bg-slate-100 text-slate-700 font-medium">{item.parentGoal}</Badge></td>
                        <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">
                          {item.weightOrConfidence}{framework === "MBO_KPI" ? "%" : "/10"}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-indigo-600">
                          {item.targetValue} <span className="text-xs text-slate-400 font-sans font-normal ml-0.5">{item.unit}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteTarget(item.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {targets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium bg-slate-50/20">
                          Chưa có chỉ tiêu mục tiêu nào được thiết lập cho kế hoạch này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

          </div>

          {/* CỘT PHẢI: KIỂM SOÁT TOÀN VẸN VÀ THUỘC TÍNH PHÂN TÍCH (4/12) */}
          <div className="xl:col-span-4 space-y-6">

            <Card className="rounded-2xl border-slate-200 shadow-xl shadow-slate-200/50 sticky top-28 overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white pb-6 pt-6 text-center">
                <CardTitle className="font-black text-base uppercase tracking-wider flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5" /> ĐÁNH GIÁ SỨC KHỎE KẾ HOẠCH
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                {/* Chỉ số Tổng hợp tùy theo Framework */}
                <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
                  {framework === "MBO_KPI" ? (
                    <>
                      <div className={cn("text-6xl font-black tracking-tighter", totalWeight === 100 ? "text-emerald-600" : "text-amber-500")}>
                        {totalWeight}%
                      </div>
                      <p className="text-slate-400 font-bold uppercase text-xs mt-1.5 tracking-wider">TỔNG TRỌNG SỐ THIẾT LẬP (CHUẨN 100%)</p>
                    </>
                  ) : (
                    <>
                      <div className="text-6xl font-black text-indigo-600 tracking-tighter">
                        {avgConfidence}
                      </div>
                      <p className="text-slate-400 font-bold uppercase text-xs mt-1.5 tracking-wider">ĐỘ TỰ TIN TRUNG BÌNH ĐẦU KỲ (THANG 10)</p>
                    </>
                  )}
                </div>

                {/* Biểu đồ Phân bổ Radar mục tiêu kế hoạch */}
                <div className="h-[260px] w-full p-4 bg-white border-b border-slate-100 relative">
                  {targets.length >= 3 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Phân bổ thiết lập" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.15} />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold">Cần tối thiểu 3 chỉ tiêu để xây dựng ma trận phân bổ Radar trực quan.</p>
                    </div>
                  )}
                </div>

                {/* Khối Thông báo/Cảnh báo Rủi ro Kế hoạch (Framework Validation Alert) */}
                <div className="p-6 bg-slate-50">
                  <Label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">Trạng thái phê duyệt nội bộ</Label>

                  {framework === "MBO_KPI" && (
                    <div className={cn("p-4 rounded-xl border flex items-start gap-3", isPlanValid ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-amber-50 text-amber-800 border-amber-200")}>
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 mt-0.5">
                        {isPlanValid ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-amber-500" />}
                      </div>
                      <div className="text-xs font-medium leading-relaxed">
                        {isPlanValid ? (
                          <><strong>Kế hoạch hợp lệ:</strong> Đã phân bổ cấu trúc trọng số tối ưu. Đủ điều kiện ban hành xuống các đơn vị.</>
                        ) : (
                          <><strong>Trọng số chưa đạt chuẩn:</strong> Tổng trọng số phòng ban hiện tại đang là <strong>{totalWeight}%</strong>. Vui lòng cân đối lại các chỉ số để đạt chuẩn 100% trước khi bấm Ban hành.</>
                        )}
                      </div>
                    </div>
                  )}

                  {framework === "OKRS" && (
                    <div className={cn("p-4 rounded-xl border flex items-start gap-3 bg-blue-50 text-blue-800 border-blue-200")}>
                      <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 mt-0.5">
                        <Compass className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-xs font-medium leading-relaxed">
                        <strong>Mục tiêu OKRs:</strong> Mô hình này không cộng dồn 100%. Các Key Results tập trung vào tính thúc đẩy mang tính thách thức cao đầu quý.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </div>
  );
}