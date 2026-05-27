"use client";

import React, { useState } from 'react';
import { Award, MousePointerClick, Target, Trash2, Network, ChevronRight } from 'lucide-react';

interface SelectedPlanItem {
    id: string;
    title: string;
    rankType: string;
    targetValue: number;
    unit: string;
}

export function ManualPlanSelectorByRankClient() {
    // Mock dữ liệu kho lưu trữ từ Page 1 cấu hình gửi sang
    const rankTasksRepository = [
        { id: 'tr-1', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CAO_CAP', taskName: 'Chủ trì nghiên cứu, xây dựng Nghị quyết, Quyết định quy phạm pháp luật cấp Tỉnh', defaultUnit: 'Đề án' },
        { id: 'tr-2', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CAO_CAP', taskName: 'Chủ trì thẩm định quy hoạch, kiến trúc số, đề án liên ngành', defaultUnit: 'Văn bản thẩm định' },
        { id: 'tr-3', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CHINH', taskName: 'Tham mưu biên soạn tờ trình, công văn hướng dẫn nghiệp vụ quy mô Sở', defaultUnit: 'Tờ trình' },
        { id: 'tr-4', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN_CHINH', taskName: 'Xử lý, thẩm tra và đưa ra ý kiến pháp lý đối với phiếu chuyển, đơn thư phức tạp', defaultUnit: 'Hồ sơ xử lý' },
        { id: 'tr-5', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN', taskName: 'Tiếp nhận, phân loại và luân chuyển văn bản đi/đến trên trục iDesk', defaultUnit: 'Văn bản' },
        { id: 'tr-6', classification: 'CONG_CHUC', rank: 'CHUYEN_VIEN', taskName: 'Trực tiếp xử lý hồ sơ dịch vụ công trực tuyến một cửa', defaultUnit: 'Hồ sơ' },
        { id: 'tr-7', classification: 'VIEN_CHUC', rank: 'VIEN_CHUC_HANG_3', taskName: 'Vận hành kỹ thuật, trực giám sát an toàn thông tin hệ thống IOC / LGSP', defaultUnit: 'Ca trực' },
    ];

    const [activeRankFilter, setActiveRankFilter] = useState<string>('CHUYEN_VIEN_CHINH');
    const [addedPlans, setAddedPlans] = useState<SelectedPlanItem[]>([]);
    const [globalValue, setGlobalValue] = useState<number>(1);

    const handleQuickAdd = (taskName: string, unit: string) => {
        if (addedPlans.some(p => p.title === taskName)) return;
        setAddedPlans([...addedPlans, {
            id: crypto.randomUUID(),
            title: taskName,
            rankType: activeRankFilter,
            targetValue: globalValue,
            unit: unit
        }]);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-6 bg-slate-50 min-h-screen text-slate-800 antialiased">
            <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-md border border-slate-800">
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Network className="w-5 h-5 text-indigo-400" /> Bảng Phân rã Chỉ tiêu Định biên theo Tiêu chuẩn Ngạch Công vụ
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Hệ thống hóa thao tác phân bổ thủ công. Chọn ngạch công vụ hành chính để truy xuất bộ nhiệm vụ đặc thù được quy định bởi pháp luật điều hành.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                {/* THANH ĐIỀU HƯỚNG BỘ LỌC THEO NGẠCH ĐẶC THÙ (4/12 COLS) */}
                <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-1.5 border-b pb-3">
                        <MousePointerClick className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Chọn Ngạch công vụ tác nghiệp</h3>
                    </div>

                    {/* Cây danh mục ngạch bậc */}
                    <div className="flex flex-col gap-1">
                        {[
                            { key: 'CHUYEN_VIEN_CAO_CAP', label: 'Chuyên viên Cao cấp', desc: 'Đề án chiến lược, văn bản quy phạm vĩ mô' },
                            { key: 'CHUYEN_VIEN_CHINH', label: 'Chuyên viên Chính', desc: 'Tham mưu tổng hợp, tờ trình, thẩm định sở' },
                            { key: 'CHUYEN_VIEN', label: 'Chuyên viên', desc: 'Thực thi tác nghiệp, xử lý hồ sơ, phiếu chuyển' },
                            { key: 'CAN_SU', label: 'Cán sự', desc: 'Hỗ trợ nghiệp vụ, lưu trữ, thống kê' },
                            { key: 'NHAN_VIEN', label: 'Nhân viên', desc: 'Thực hiện các công việc thừa hành, phục vụ' },
                            { key: 'VIEN_CHUC_HANG_1', label: 'Viên chức Hạng I', desc: 'Chủ trì đề án khoa học, công nghệ cấp bộ/tỉnh' },
                            { key: 'VIEN_CHUC_HANG_2', label: 'Viên chức Hạng II', desc: 'Thực hiện nhiệm vụ chuyên môn phức tạp' },
                            { key: 'VIEN_CHUC_HANG_3', label: 'Viên chức Hạng III', desc: 'Thực hành chuyên môn nghiệp vụ cơ bản' },
                            { key: 'VIEN_CHUC_HANG_4', label: 'Viên chức Hạng IV', desc: 'Hỗ trợ kỹ thuật, nghiệp vụ đơn giản' },
                        ].map((rank) => (
                            <button
                                key={rank.key}
                                type="button"
                                onClick={() => setActiveRankFilter(rank.key)}
                                className={`p-3 rounded-xl text-left border transition-all flex items-center justify-between ${activeRankFilter === rank.key ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 hover:bg-slate-50 bg-white'}`}
                            >
                                <div className="space-y-0.5">
                                    <div className="text-xs font-black">{rank.label}</div>
                                    <div className={`text-[10px] ${activeRankFilter === rank.key ? 'text-slate-400' : 'text-slate-500'}`}>{rank.desc}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-600">Định mức số lượng gán nhanh:</span>
                        <input
                            type="number"
                            value={globalValue}
                            onChange={e => setGlobalValue(Math.max(1, Number(e.target.value)))}
                            className="w-16 h-8 text-center border font-mono font-bold rounded-md bg-white border-slate-200"
                        />
                    </div>

                    {/* KHO VIỆC LỌC ĐỘNG THEO NGẠCH ĐÃ CHỌN */}
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pt-2 border-t">
                        {rankTasksRepository
                            .filter(item => item.rank === activeRankFilter)
                            .map(task => {
                                const added = addedPlans.some(p => p.title === task.taskName);
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => !added && handleQuickAdd(task.taskName, task.defaultUnit)}
                                        className={`p-3 border rounded-xl flex items-center justify-between transition-all text-xs font-semibold ${added ? 'bg-slate-50 border-slate-100 opacity-40 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/10 cursor-pointer'}`}
                                    >
                                        <div className="text-slate-800 leading-relaxed pr-3">{task.taskName}</div>
                                        <span className="text-[9px] font-black font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded shrink-0">
                                            +{task.defaultUnit}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* BẢNG MA TRẬN KẾ HOẠCH CHI TIẾT SAU KHI PHÂN PHỐI (8/12 COLS) */}
                <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b bg-slate-50/50 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Cấu trúc kế hoạch tổng hợp sau phân rã ngạch</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                    <th className="py-3 px-4 w-[55%]">Nhiệm vụ hành chính công vụ</th>
                                    <th className="py-3 px-3">Yêu cầu cấp ngạch</th>
                                    <th className="py-3 px-3 text-right">Chỉ tiêu áp đặt</th>
                                    <th className="py-3 px-4 text-center w-[60px]">Hủy</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                {addedPlans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="py-3.5 px-4 font-bold text-slate-900 leading-relaxed">{plan.title}</td>
                                        <td className="py-3.5 px-3">
                                            <span className="bg-slate-150 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider">
                                                {plan.rankType.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-3 text-right">
                                            <div className="inline-flex items-center gap-1 justify-end">
                                                <input
                                                    type="number"
                                                    value={plan.targetValue}
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        setAddedPlans(addedPlans.map(p => p.id === plan.id ? { ...p, targetValue: val } : p));
                                                    }}
                                                    className="w-14 h-7 text-right font-mono font-black text-indigo-600 border border-slate-200 rounded px-1"
                                                />
                                                <span className="text-[10px] text-slate-400 font-normal font-sans min-w-[50px] text-left ml-0.5">{plan.unit}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <button onClick={() => setAddedPlans(addedPlans.filter(p => p.id !== plan.id))} className="text-slate-400 hover:text-red-600 p-1.5 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {addedPlans.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-12 text-slate-400 font-medium bg-slate-50/10">
                                            Chưa có tác vụ ngạch nào được đưa vào ma trận thực thi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}