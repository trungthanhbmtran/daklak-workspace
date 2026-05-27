"use client";

import React, { useState, useMemo } from 'react';
import {
  Settings2, LayoutGrid, Zap, Target,
  FolderPlus, Trash2, ShieldAlert, CheckCircle2,
  Compass, BarChart3, HelpCircle, FileText,
  Sparkles, Network, ArrowRightCircle, ShieldCheck,
  Activity, Eye, ClipboardCheck, Layers, GitMerge
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- HỆ THỐNG MÔ HÌNH QUẢN TRỊ ĐA DẠNG ---
type ManagementFramework = 'BSC_KPI' | 'OKRS' | 'OGSM' | 'MBO';
type GovPerspective = 'STRATEGIC_GOAL' | 'DIGITAL_TRANSFORM' | 'OPERATIONAL_REFORM' | 'RESOURCE_FINANCE';

interface TargetPlanItem {
  id: string;
  title: string;
  framework: ManagementFramework; // Thuộc mô hình nào
  perspective: GovPerspective;
  legalBasis: string;
  metricFactor: number; // Trọng số, Độ tự tin, hoặc Mức độ ưu tiên tùy theo mô hình
  targetValue: number;
  unit: string;
  supervisor: string;
  aiStatus: 'RECOMMENDED' | 'VERIFIED' | 'CUSTOM';
}

import { toast } from 'sonner';
import { useCreateMasterPlan } from '../../hooks';

export function MasterPlanListClient() {
  const [framework, setFramework] = useState<ManagementFramework>('BSC_KPI');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { mutateAsync: createMasterPlan } = useCreateMasterPlan();

  // Dữ liệu ma trận tích hợp liên thông
  const [items, setItems] = useState<TargetPlanItem[]>([]);

  // States của Form nhập liệu
  const [newTitle, setNewTitle] = useState('');
  const [newPerspective, setNewPerspective] = useState<GovPerspective>('DIGITAL_TRANSFORM');
  const [newLegalBasis, setNewLegalBasis] = useState('');
  const [newMetricFactor, setNewMetricFactor] = useState(20);
  const [newTargetValue, setNewTargetValue] = useState(100);
  const [newUnit, setNewUnit] = useState('%');
  const [newSupervisor, setNewSupervisor] = useState('');

  // --- AI ENGINE: TỰ ĐỘNG PHÂN RÃ KẾ HOẠCH THEO TỪNG MÔ HÌNH ---
  const handleAiGenerateFramework = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      let aiSuggestedItems: TargetPlanItem[] = [];

      if (framework === 'OGSM') {
        aiSuggestedItems = [
          {
            id: 'ogsm-1',
            title: '[Strategy 1] Số hóa 100% kết quả thủ tục hành chính còn hiệu lực',
            framework: 'OGSM',
            perspective: 'OPERATIONAL_REFORM',
            legalBasis: 'Nghị định 45/2020/NĐ-CP',
            metricFactor: 9, // Mức độ ưu tiên chiến lược (Thang 10)
            targetValue: 100, unit: '%',
            supervisor: 'Văn phòng Sở / Bộ phận Một cửa',
            aiStatus: 'RECOMMENDED'
          },
          {
            id: 'ogsm-2',
            title: '[Measure 1.1] Tích hợp thành công kho dữ liệu điện tử cá nhân trên Cổng dịch vụ công',
            framework: 'OGSM',
            perspective: 'DIGITAL_TRANSFORM',
            legalBasis: 'Đề án 06/CP',
            metricFactor: 10,
            targetValue: 1, unit: 'Kho số hóa',
            supervisor: 'Trung tâm IOC',
            aiStatus: 'RECOMMENDED'
          }
        ];
      } else if (framework === 'MBO') {
        aiSuggestedItems = [
          {
            id: 'mbo-1',
            title: 'Hoàn thành chỉ tiêu phát triển hạ tầng dữ liệu mở (Open Data) của tỉnh',
            framework: 'MBO',
            perspective: 'STRATEGIC_GOAL',
            legalBasis: 'Quyết định 942/QĐ-TTg về Chiến lược phát triển Chính phủ số',
            metricFactor: 100, // Định biên cam kết tối đa
            targetValue: 5, unit: 'Danh mục dữ liệu',
            supervisor: 'Phòng Công nghệ thông tin',
            aiStatus: 'RECOMMENDED'
          }
        ];
      } else {
        // Fallback quay lại mẫu OKR / KPI nếu chọn mô hình cũ
        aiSuggestedItems = [
          {
            id: 'ai-default',
            title: 'Triển khai giải pháp xác thực tập trung SSO kết nối Hệ thống định danh VNeID',
            framework: framework,
            perspective: 'DIGITAL_TRANSFORM',
            legalBasis: 'Đề án 06/CP',
            metricFactor: framework === 'BSC_KPI' ? 100 : 8,
            targetValue: 100, unit: '%',
            supervisor: 'Phòng Hạ tầng số',
            aiStatus: 'RECOMMENDED'
          }
        ];
      }
      setItems(aiSuggestedItems);
      setIsAiProcessing(false);
    }, 1000);
  };

  // --- XỬ LÝ SỰ KIỆN FORM ---
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TargetPlanItem = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      framework: framework,
      perspective: newPerspective,
      legalBasis: newLegalBasis || 'Chưa có',
      metricFactor: newMetricFactor,
      targetValue: newTargetValue,
      unit: newUnit,
      supervisor: newSupervisor || 'Chưa phân công',
      aiStatus: 'CUSTOM'
    };

    setItems([...items, newItem]);
    setNewTitle('');
    toast.success('Đã thêm chỉ tiêu mới vào danh mục liên thông');
  };

  const handlePublish = async () => {
    if (items.length === 0) {
      toast.error('Cần ít nhất 1 chỉ tiêu để ban hành kế hoạch!');
      return;
    }
    
    // Validate weight for BSC_KPI
    const totalWeight = items.reduce((sum, item) => sum + item.metricFactor, 0);
    if (framework === 'BSC_KPI' && totalWeight !== 100) {
      toast.error('Trọng số BSC KPI chưa đạt 100%. Vui lòng điều chỉnh!');
      return;
    }

    try {
      const payload = {
        title: `Kế hoạch ${framework} - Quý ${Math.floor(new Date().getMonth() / 3) + 1}/${new Date().getFullYear()}`,
        type: framework,
        tasks: items.map(item => ({
          title: item.title,
          weight: item.metricFactor,
          targetValue: item.targetValue,
          unit: item.unit,
          supervisor: item.supervisor,
        }))
      };

      await createMasterPlan(payload);

      toast.success(`Đã ban hành kế hoạch ${framework} thành công!`);
      setItems([]);
    } catch (error) {
      toast.error('Lỗi khi ban hành kế hoạch');
    }
  };

  // --- KIỂM TRA SỨC KHỎE KẾ HOẠCH THEO ĐẶC THÙ MÔ HÌNH ---
  const healthMetrics = useMemo(() => {
    const totalWeight = items.reduce((sum, item) => sum + item.metricFactor, 0);

    switch (framework) {
      case 'BSC_KPI':
        return { label: `${totalWeight}%`, subLabel: 'TỔNG TRỌNG SỐ TÍCH LŨY (CHUẨN 100%)', isValid: totalWeight === 100, color: totalWeight === 100 ? 'text-emerald-600' : 'text-amber-500' };
      case 'OKRS':
        const avgOkr = items.length ? totalWeight / items.length : 0;
        return { label: avgOkr.toFixed(1), subLabel: 'ĐỘ TỰ TIN TRUNG BÌNH KR (THANG 10)', isValid: items.length > 0, color: 'text-indigo-600' };
      case 'OGSM':
        return { label: `${items.length} Mục`, subLabel: 'SỐ LƯỢNG CHIẾN LƯỢC & BIỆN PHÁP ĐÃ PHÂN RÃ', isValid: items.length > 0, color: 'text-purple-600' };
      case 'MBO':
        return { label: 'MBO ACTIVE', subLabel: 'QUẢN TRỊ THEO MỤC TIÊU CAM KẾT ĐẦU RA', isValid: items.length > 0, color: 'text-blue-600' };
    }
  }, [items, framework]);

  const radarChartData = useMemo(() => {
    return items.map(item => ({
      subject: item.title.length > 18 ? item.title.substring(0, 18) + '...' : item.title,
      value: framework === 'BSC_KPI' ? item.metricFactor : item.metricFactor * 10
    }));
  }, [items, framework]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-50 min-h-screen antialiased text-slate-800">

      {/* 1. MODULE TỐI ƯU ĐA MÔ HÌNH QUẢN TRỊ */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md">
            Hệ thống Quản trị Tổng thể đa cấu trúc
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Network className="w-6 h-6 text-indigo-400" /> Trung tâm Hoạch định & Phân rã Chỉ tiêu Quốc gia
          </h1>
          <p className="text-slate-400 text-xs font-medium max-w-2xl">
            Tích hợp linh hoạt giữa các trường phái quản trị hiện đại, cho phép chuyển đổi mô hình dữ liệu ngay lập tức mà không làm gãy trục kiểm tra an toàn.
          </p>
        </div>

        {/* Bộ điều khiển đa mô hình */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-850 p-1.5 rounded-xl border border-slate-700 relative z-10 w-full lg:w-auto">
          {(['BSC_KPI', 'OKRS', 'OGSM', 'MBO'] as ManagementFramework[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setFramework(mode); setItems([]); }}
              className={`flex-1 lg:flex-none text-center px-3 py-2 text-[11px] font-black rounded-lg transition-all ${framework === mode ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. AI CO-PILOT ADAPTIVE BANNER */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-md shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AI Engine thích ứng cấu trúc: <span className="text-indigo-600 font-extrabold">{framework.replace('_', ' ')}</span>
            </h3>
            <p className="text-xs text-slate-650 mt-0.5 font-medium">
              Kích hoạt thuật toán bóc tách thông minh dựa trên logic của riêng mô hình {framework}. Đảm bảo các chỉ số đầu ra tương thích hoàn toàn với trục giám sát của chính quyền số.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiGenerateFramework}
          disabled={isAiProcessing}
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
        >
          {isAiProcessing ? "Đang cấu hình dữ liệu..." : `AI Phân rã theo chuẩn ${framework.replace('_', ' ')}`}
        </button>
      </div>

      {/* 3. LƯỚI GIAO DIỆN HOẠT ĐỘNG CHÍNH */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* KHỐI TRÁI: BIỂU MẪU VÀ BẢNG THỰC THI (8/12) */}
        <div className="xl:col-span-8 space-y-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-4">
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              Khởi tạo mục tiêu định biên thuộc phân hệ {framework.replace('_', ' ')}
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Nội dung chỉ tiêu / Hành động thực thi</label>
                  <input
                    type="text"
                    placeholder={`Nhập nội dung tương thích với cấu trúc điều hành ${framework}...`}
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Trục khía cạnh chiến lược</label>
                  <select
                    value={newPerspective}
                    onChange={e => setNewPerspective(e.target.value as GovPerspective)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 bg-slate-50/50 border-slate-200 font-bold text-slate-700"
                  >
                    <option value="DIGITAL_TRANSFORM">Hạ tầng số & Chuyển đổi số</option>
                    <option value="OPERATIONAL_REFORM">Cải cách hành chính & Quy trình</option>
                    <option value="STRATEGIC_GOAL">Chỉ tiêu KT-XH cốt lõi</option>
                    <option value="RESOURCE_FINANCE">Tối ưu nguồn lực công</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Văn bản căn cứ pháp lý</label>
                  <input
                    type="text"
                    placeholder="Quyết định, Nghị quyết số..."
                    value={newLegalBasis}
                    onChange={e => setNewLegalBasis(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 border-slate-200 font-medium"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Cơ quan chịu trách nhiệm chính</label>
                  <input
                    type="text"
                    placeholder="Tên đơn vị, phòng ban phụ trách..."
                    value={newSupervisor}
                    onChange={e => setNewSupervisor(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 border-slate-200 font-medium"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">
                    {framework === 'BSC_KPI' ? 'Trọng số (%)' : framework === 'OKRS' ? 'Độ tự tin (1-10)' : 'Ưu tiên (1-10)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMetricFactor}
                    onChange={e => setNewMetricFactor(Number(e.target.value))}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 font-mono font-bold text-center border-slate-200"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Chỉ tiêu / Đơn vị</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={newTargetValue}
                      onChange={e => setNewTargetValue(Number(e.target.value))}
                      className="w-2/3 h-10 text-xs border rounded-xl px-2 py-2 font-mono font-bold text-right border-slate-200"
                      required
                    />
                    <input
                      type="text"
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="w-1/3 h-10 text-xs border rounded-xl px-1 py-2 text-center font-bold border-slate-200 bg-slate-50"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs px-6 h-10 rounded-xl transition-all shadow-sm">
                  CẬP NHẬT VÀO HỆ THỐNG
                </button>
              </div>
            </form>
          </div>

          {/* Bảng phân rã sơ đồ tích hợp giám sát */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Danh mục chỉ tiêu liên thông tổng thể</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-[40%]">Nội dung & Căn cứ thực thi</th>
                    <th className="py-3 px-3">Khung quản trị</th>
                    <th className="py-3 px-3">Cơ quan giám sát</th>
                    <th className="py-3 px-2 text-center">Định mức</th>
                    <th className="py-3 px-3 text-right">Mục tiêu</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-bold text-slate-900 leading-relaxed flex items-start gap-1.5">
                          {item.aiStatus === 'RECOMMENDED' && <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />}
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Căn cứ: {item.legalBasis}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-slate-100 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded border uppercase">
                          {item.framework}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-600">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" /> {item.supervisor}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-black text-slate-900">
                        {item.metricFactor}{item.framework === 'BSC_KPI' ? '%' : '/10'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-indigo-600 text-sm">
                        {item.targetValue} <span className="text-[10px] text-slate-400 font-sans font-normal">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* KHỐI PHẢI: THẨM ĐỊNH TỰ ĐỘNG CHẤT LƯỢNG (4/12) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden sticky top-6">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Thẩm định mật độ chỉ tiêu
              </h3>
            </div>

            <div className="py-6 text-center border-b border-slate-100 bg-slate-50/50">
              <div className={`text-4xl font-black tracking-tight ${healthMetrics.color}`}>
                {healthMetrics.label}
              </div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-1">
                {healthMetrics.subLabel}
              </p>
            </div>

            {/* Radar Map hiển thị phân rã đa chiều */}
            <div className="h-[240px] w-full p-4 bg-white border-b border-slate-100 flex items-center justify-center">
              {radarChartData.length >= 3 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.12} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs flex flex-col items-center gap-1.5">
                  <HelpCircle className="w-6 h-6 text-slate-300" />
                  <span>Cần tối thiểu 3 chỉ tiêu để dựng bản đồ mật độ.</span>
                </div>
              )}
            </div>

            <div className="p-5 space-y-4 bg-slate-50/80">
              <button
                type="button"
                onClick={handlePublish}
                className="w-full inline-flex items-center justify-center gap-1.5 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all"
              >
                <ClipboardCheck className="w-4 h-4" /> Phê duyệt & Số hóa dữ liệu kế hoạch
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}