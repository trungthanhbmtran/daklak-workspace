"use client";

import React, { useState, useMemo } from 'react';
import {
  Settings2, LayoutGrid, Zap, Target,
  FolderPlus, Trash2, ShieldAlert, CheckCircle2,
  Compass, BarChart3, HelpCircle, FileText,
  Sparkles, Network, ArrowRightCircle, ShieldCheck,
  Activity, Eye, ClipboardCheck
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU NÂNG CẤP CHUẨN CÔNG VỤ ---
type ManagementFramework = 'BSC_KPI' | 'OKRS';
type GovPerspective = 'STRATEGIC_GOAL' | 'DIGITAL_TRANSFORM' | 'OPERATIONAL_REFORM' | 'RESOURCE_FINANCE';

interface TargetPlanItem {
  id: string;
  title: string; // Tên chỉ tiêu chuẩn SMART
  perspective: GovPerspective; // Phân loại khía cạnh theo chuẩn quản lý nhà nước
  legalBasis: string; // Căn cứ pháp lý / Quyết định giao nhiệm vụ
  metricFactor: number; // Trọng số (%) đối với KPI, hoặc Độ tự tin (1-10) đối với OKR
  targetValue: number;
  unit: string;
  supervisor: string; // Đơn vị/Cá nhân chịu trách nhiệm giám sát chính
  aiStatus: 'RECOMMENDED' | 'VERIFIED' | 'CUSTOM'; // Trạng thái hỗ trợ từ AI
}

export function MasterPlanListClient() {
  const [framework, setFramework] = useState<ManagementFramework>('BSC_KPI');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Dữ liệu mẫu ban đầu theo chuẩn hạ tầng dữ liệu và chuyển đổi số hành chính công
  const [items, setItems] = useState<TargetPlanItem[]>([
    {
      id: 'gov-1',
      title: 'Đảm bảo tỷ lệ uptime hệ thống Trục liên thông dữ liệu LGSP tỉnh',
      perspective: 'DIGITAL_TRANSFORM',
      legalBasis: 'QĐ 124/QĐ-UBND về Kiến trúc Chính quyền số',
      metricFactor: 40,
      targetValue: 99.9,
      unit: '%',
      supervisor: 'Trung tâm Giám sát điều hành đô thị thông minh (IOC)',
      aiStatus: 'VERIFIED'
    },
    {
      id: 'gov-2',
      title: 'Tích hợp các phân hệ gRPC API kết nối camera giám sát tập trung về Trung tâm IOC',
      perspective: 'DIGITAL_TRANSFORM',
      legalBasis: 'Kế hoạch 45-KH/STTTT thúc đẩy chuyển đổi số',
      metricFactor: 35,
      targetValue: 12,
      unit: 'API',
      supervisor: 'Phòng Hạ tầng số & An toàn thông tin',
      aiStatus: 'VERIFIED'
    },
    {
      id: 'gov-3',
      title: 'Nâng cao tỷ lệ xử lý hồ sơ, văn bản hành chính đúng hạn trên hệ thống quản lý văn bản iDesk',
      perspective: 'OPERATIONAL_REFORM',
      legalBasis: 'Nghị quyết 02-NQ/TU về Cải cách hành chính công',
      metricFactor: 25,
      targetValue: 100,
      unit: '%',
      supervisor: 'Bộ phận Tiếp nhận và Trả kết quả',
      aiStatus: 'RECOMMENDED'
    },
  ]);

  // Biến quản lý form nhập liệu
  const [newTitle, setNewTitle] = useState('');
  const [newPerspective, setNewPerspective] = useState<GovPerspective>('DIGITAL_TRANSFORM');
  const [newLegalBasis, setNewLegalBasis] = useState('');
  const [newMetricFactor, setNewMetricFactor] = useState(20);
  const [newTargetValue, setNewTargetValue] = useState(100);
  const [newUnit, setNewUnit] = useState('%');
  const [newSupervisor, setNewSupervisor] = useState('');

  // --- HỆ THỐNG KIỂM TRA TOÀN VẸN (HEALTH CHECK) ---
  const healthMetrics = useMemo(() => {
    const totalWeight = items.reduce((sum, item) => sum + item.metricFactor, 0);
    if (framework === 'BSC_KPI') {
      return {
        value: totalWeight,
        label: `${totalWeight}%`,
        subLabel: 'Tổng trọng số tích lũy (Yêu cầu chuẩn: 100%)',
        isValid: totalWeight === 100
      };
    } else {
      if (items.length === 0) return { value: 0, label: '0.0', subLabel: 'Độ tự tin trung bình', isValid: false };
      const avgConfidence = totalWeight / items.length;
      return {
        value: avgConfidence,
        label: avgConfidence.toFixed(1),
        subLabel: 'Độ tự tin mục tiêu đầu kỳ (Thang 10)',
        isValid: items.length > 0
      };
    }
  }, [items, framework]);

  // Đồng bộ hóa cấu trúc dữ liệu cho biểu đồ mạng nhện Radar Map
  const radarChartData = useMemo(() => {
    return items.map(item => ({
      subject: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
      value: framework === 'BSC_KPI' ? item.metricFactor : item.metricFactor * 10
    }));
  }, [items, framework]);

  // --- CƠ CHẾ AI CO-PILOT GỢI Ý & TỐI ƯU KẾ HOẠCH BẰNG MỘT CÚ CLICK ---
  const handleAiGenerateFramework = () => {
    setIsAiProcessing(true);
    setTimeout(() => {
      const aiSuggestedItems: TargetPlanItem[] = [
        {
          id: 'ai-1',
          title: 'Số hóa và cấu trúc hóa hồ sơ kết quả giải quyết thủ tục hành chính',
          perspective: 'OPERATIONAL_REFORM',
          legalBasis: 'Nghị định 45/2020/NĐ-CP về thủ tục hành chính trên môi trường điện tử',
          metricFactor: framework === 'BSC_KPI' ? 30 : 8,
          targetValue: 100,
          unit: '%',
          supervisor: 'Văn phòng Sở / Bộ phận Một cửa',
          aiStatus: 'RECOMMENDED'
        },
        {
          id: 'ai-2',
          title: 'Hoàn thiện triển khai giải pháp xác thực tập trung SSO kết nối Hệ thống định danh quốc gia VNeID',
          perspective: 'DIGITAL_TRANSFORM',
          legalBasis: 'Đề án 06/CP của Thủ tướng Chính phủ',
          metricFactor: framework === 'BSC_KPI' ? 40 : 9,
          targetValue: 100,
          unit: '%',
          supervisor: 'Trung tâm IOC phối hợp Phòng CNTT',
          aiStatus: 'RECOMMENDED'
        },
        {
          id: 'ai-3',
          title: 'Tổ chức tập huấn, nâng cao năng lực phân tích dữ liệu số cho công chức viên chức thuộc Sở',
          perspective: 'RESOURCE_FINANCE',
          legalBasis: 'Quyết định 146/QĐ-TTg về nâng cao nhận thức số quốc gia',
          metricFactor: framework === 'BSC_KPI' ? 30 : 7,
          targetValue: 3,
          unit: 'Lớp',
          supervisor: 'Phòng Tổ chức cán bộ',
          aiStatus: 'RECOMMENDED'
        }
      ];
      setItems(aiSuggestedItems);
      setIsAiProcessing(false);
    }, 1200);
  };

  const handleSwitchFramework = (mode: ManagementFramework) => {
    setFramework(mode);
    setItems([]);
    setNewTitle('');
    setNewMetricFactor(mode === 'BSC_KPI' ? 20 : 7);
  };

  const handleAddPlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: TargetPlanItem = {
      id: crypto.randomUUID(),
      title: newTitle,
      perspective: newPerspective,
      legalBasis: newLegalBasis || 'Đang cập nhật văn bản căn cứ',
      metricFactor: Number(newMetricFactor),
      targetValue: Number(newTargetValue),
      unit: newUnit,
      supervisor: newSupervisor || 'Đơn vị thực hiện',
      aiStatus: 'CUSTOM'
    };

    setItems([...items, newItem]);
    setNewTitle('');
    setNewLegalBasis('');
    setNewSupervisor('');
  };

  const handleDeletePlanItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4 md:p-6 bg-slate-50 min-h-screen antialiased text-slate-800">

      {/* 1. HEADER CHUẨN TRỤC CHIẾN LƯỢC QUỐC GIA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md">
              Hệ thống lõi quản trị LGSP / IOC
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Network className="w-6 h-6 text-indigo-400 shrink-0" /> Thiết kế & Phân rã Kế hoạch Chiến lược Tổng thể
          </h1>
          <p className="text-slate-400 text-xs font-medium max-w-2xl">
            Hỗ trợ chuẩn hóa cấu trúc chỉ tiêu, gắn định biên căn cứ pháp lý, phân rã trách nhiệm giám sát độc lập và tối ưu hóa ma trận khả thi bằng mô hình trí tuệ nhân tạo (AI Engine).
          </p>
        </div>

        {/* Khối chức năng chuyển đổi nhanh mô hình điều hành */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 relative z-10 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleSwitchFramework('BSC_KPI')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${framework === 'BSC_KPI' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> CHUẨN BSC / KPI
          </button>
          <button
            type="button"
            onClick={() => handleSwitchFramework('OKRS')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${framework === 'OKRS' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Zap className="w-3.5 h-3.5" /> MÔ HÌNH OKRs MỞ
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC AI CO-PILOT SUGGESTION BANNER */}
      <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex gap-3">
          <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">AI Trợ lý Công vụ - Đề xuất cấu hình kế hoạch khả thi</h3>
            <p className="text-xs text-indigo-900/80 mt-0.5 font-medium">
              Dựa trên định hướng chiến lược quốc gia, AI có thể tự động bóc tách văn bản, sinh ma trận chỉ tiêu thành phần kèm trọng số an toàn, bảo đảm luồng phân rã minh bạch.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiGenerateFramework}
          disabled={isAiProcessing}
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all group"
        >
          {isAiProcessing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Hệ thống đang tính toán...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" /> Kích hoạt AI Đề xuất Kế hoạch
              <ArrowRightCircle className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      {/* 3. BỐ CỤC LƯỚI CHI TIẾT (GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* KHỐI TRÁI: FORM KHỞI TẠO VÀ BẢNG QUẢN LÝ PHAN RÃ (8/12 COLS) */}
        <div className="xl:col-span-8 space-y-6">

          {/* Form Thiết lập định biên nâng cao */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-4 mb-4">
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              Thiết lập chỉ tiêu thành phần & Gán trục giám sát độc lập
            </h3>

            <form onSubmit={handleAddPlanItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Nội dung chỉ tiêu (Định lượng SMART)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tối ưu hóa hạ tầng kết nối Cloud, nâng tỷ lệ đồng bộ hồ sơ..."
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border-slate-200 font-semibold"
                    required
                  />
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Khía cạnh mục tiêu chiến lược</label>
                  <select
                    value={newPerspective}
                    onChange={e => setNewPerspective(e.target.value as GovPerspective)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border-slate-200 font-bold text-slate-700"
                  >
                    <option value="DIGITAL_TRANSFORM">Hạ tầng số & Chuyển đổi số</option>
                    <option value="OPERATIONAL_REFORM">Cải cách hành chính & Quy trình nội bộ</option>
                    <option value="STRATEGIC_GOAL">Chỉ tiêu kinh tế - xã hội cốt lõi</option>
                    <option value="RESOURCE_FINANCE">Tối ưu nguồn lực & Tài chính công</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Căn cứ pháp lý / Quyết định giao</label>
                  <input
                    type="text"
                    placeholder="Nghị quyết, Quyết định số..."
                    value={newLegalBasis}
                    onChange={e => setNewLegalBasis(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 border-slate-200 font-medium"
                  />
                </div>

                <div className="md:col-span-4 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Cơ quan / Đơn vị chịu trách nhiệm giám sát</label>
                  <input
                    type="text"
                    placeholder="Tên Phòng, Ban, Trung tâm quản lý..."
                    value={newSupervisor}
                    onChange={e => setNewSupervisor(e.target.value)}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 border-slate-200 font-medium"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">
                    {framework === 'BSC_KPI' ? 'Trọng số (%)' : 'Độ tự tin (1-10)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={framework === 'BSC_KPI' ? 100 : 10}
                    value={newMetricFactor}
                    onChange={e => setNewMetricFactor(Number(e.target.value))}
                    className="w-full h-10 text-xs border rounded-xl px-3 py-2 font-mono font-bold text-center border-slate-200"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 text-xs block">Mục tiêu định biên</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      step="any"
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
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs px-6 h-10 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  GÁN VÀO MA TRẬN TỔNG THỂ
                </button>
              </div>
            </form>
          </div>

          {/* Ma trận chỉ tiêu tích hợp trục giám sát chức năng */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Cấu trúc phân rã mục tiêu chiến lược hành chính công</h3>
              </div>
              <span className="text-[11px] font-medium text-slate-500">Số lượng: <strong>{items.length} Chỉ tiêu hiện hành</strong></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 w-[35%]">Nội dung chỉ tiêu & Cơ sở hành chính</th>
                    <th className="py-3 px-3">Phân nhóm</th>
                    <th className="py-3 px-3">Cơ quan giám sát chủ trì</th>
                    <th className="py-3 px-2 text-center w-[100px]">{framework === 'BSC_KPI' ? 'Trọng số' : 'Độ tự tin'}</th>
                    <th className="py-3 px-3 text-right w-[120px]">Chỉ tiêu giao</th>
                    <th className="py-3 px-4 text-center w-[60px]">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-bold text-slate-900 leading-relaxed flex items-start gap-1.5">
                          {item.aiStatus === 'VERIFIED' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" title="Đã được hệ thống kiểm chứng" />}
                          {item.aiStatus === 'RECOMMENDED' && <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" title="Do AI thông minh đề xuất" />}
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-300" /> Căn cứ: {item.legalBasis}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border tracking-wide uppercase ${item.perspective === 'DIGITAL_TRANSFORM' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          item.perspective === 'OPERATIONAL_REFORM' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            item.perspective === 'STRATEGIC_GOAL' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                              'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                          {item.perspective.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-semibold">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {item.supervisor}
                        </div>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-black text-slate-900 bg-slate-50/30">
                        {item.metricFactor}{framework === 'BSC_KPI' ? '%' : '/10'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-indigo-600 text-sm">
                        {item.targetValue} <span className="text-[10px] text-slate-400 font-sans font-normal ml-0.5">{item.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeletePlanItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium bg-slate-50/20">
                        Hệ thống trống. Hãy sử dụng tính năng "AI Đề xuất Kế hoạch" hoặc tự nhập dữ liệu đầu kỳ.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* KHỐI PHẢI: PHÂN TÍCH ĐA CHIỀU (RADAR MAP) & KIỂM TRA THẨM ĐỊNH (4/12 COLS) */}
        <div className="xl:col-span-4 space-y-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden sticky top-6">
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-400" /> Bảng Thống kê & Thẩm định Sức khỏe
              </h3>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Điểm số kiểm định tổng thể */}
            <div className="py-6 text-center border-b border-slate-100 bg-slate-50/50 space-y-1">
              <div className={`text-5xl font-black tracking-tight ${framework === 'BSC_KPI' && !healthMetrics.isValid ? 'text-amber-600' : 'text-indigo-600'}`}>
                {healthMetrics.label}
              </div>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider px-4">
                {healthMetrics.subLabel}
              </p>
            </div>

            {/* Đồ thị mạng nhện phân bổ mật độ chỉ tiêu */}
            <div className="h-[260px] w-full p-4 bg-white border-b border-slate-100 flex items-center justify-center">
              {radarChartData.length >= 3 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs flex flex-col items-center gap-1.5">
                  <HelpCircle className="w-7 h-7 text-slate-300" />
                  <span className="font-medium max-w-[200px] leading-relaxed">Cần tối thiểu 3 mục tiêu chỉ tiêu độc lập để dựng sơ đồ ma trận phân rã Radar trực quan.</span>
                </div>
              )}
            </div>

            {/* Khối quản trị phê duyệt & Chuyển giao thông tin AI */}
            <div className="p-5 space-y-4 bg-slate-50/80">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase block tracking-wider mb-2">Trạng thái phê duyệt liên thông</label>

                {framework === 'BSC_KPI' ? (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${healthMetrics.isValid ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/60 border-amber-200 text-amber-900'}`}>
                    <div className="shrink-0 mt-0.5">
                      {healthMetrics.isValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="space-y-0.5 font-medium">
                      <span className="font-bold block">{healthMetrics.isValid ? 'Cấu trúc hợp lệ (100%):' : 'Trọng số chưa cân bằng:'}</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {healthMetrics.isValid
                          ? 'Dữ liệu đạt chuẩn phân rã của cơ quan quản lý. Đủ điều kiện đồng bộ lên Trục liên thông LGSP và khóa sơ đồ.'
                          : `Tổng trọng số hiện tại là ${healthMetrics.label}. Cân đối lại các chỉ số thành phần về đúng 100% để mở khóa nút ban hành.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border bg-sky-50/60 border-sky-200 text-sky-900 text-xs flex items-start gap-2.5">
                    <Compass className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 font-medium">
                      <span className="font-bold block">Định hướng OKRs linh hoạt:</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Mô hình hướng tới cam kết hiệu suất cao và đổi mới sáng tạo, không bắt buộc tổng phân bổ tích lũy đạt 100%.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thao tác ký số ban hành kế hoạch */}
              <button
                type="button"
                disabled={framework === 'BSC_KPI' && !healthMetrics.isValid}
                className="w-full inline-flex items-center justify-center gap-1.5 h-11 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed font-bold text-white text-xs rounded-xl shadow-sm transition-all uppercase tracking-wider"
              >
                <ClipboardCheck className="w-4 h-4" /> Ký số ban hành & Khóa kế hoạch
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}