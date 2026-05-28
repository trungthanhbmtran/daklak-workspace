"use client";

import React, { useState } from 'react';
import {
  FolderPlus, Sparkles, GitMerge, Trash2, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useMasterPlanContext, type ManagementFramework, type GovPerspective } from './MasterPlanContext';
import { useMutation } from '@tanstack/react-query';
import { hrmPlansApi } from '@/features/hrm/api';
import { aiApi } from '@/features/hrm/api/ai.api';
import { Button } from "@/components/ui/button";
import { organizationApi } from '@/features/system-admin/organization/api';

interface TargetPlanItem {
  id: string;
  title: string;
  framework: ManagementFramework;
  perspective: GovPerspective;
  legalBasis: string;
  metricFactor: number;
  targetValue: number;
  unit: string;
  supervisor: string;
  rankType: string;
  rankId: number;
  aiStatus: 'RECOMMENDED' | 'VERIFIED' | 'CUSTOM';
}

export function MasterPlanForm() {
  const { state, actions } = useMasterPlanContext();
  const [framework, setFramework] = useState<ManagementFramework>('BSC_KPI');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const { mutateAsync: createMasterPlan } = useMutation({
    mutationFn: async (payload: any) => hrmPlansApi.create(payload)
  });

  const [items, setItems] = useState<TargetPlanItem[]>([]);

  const [planTitle, setPlanTitle] = useState('');
  const [planObjective, setPlanObjective] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newPerspective, setNewPerspective] = useState<GovPerspective>('DIGITAL_TRANSFORM');
  const [newLegalBasis, setNewLegalBasis] = useState('');
  const [newMetricFactor, setNewMetricFactor] = useState(20);
  const [newTargetValue, setNewTargetValue] = useState(100);
  const [newUnit, setNewUnit] = useState('%');
  const [newSupervisor, setNewSupervisor] = useState('');
  const [newRankId, setNewRankId] = useState<number>(0);

  const handleAiGenerateFramework = async () => {
    if (!planTitle.trim() || !planObjective.trim()) {
      toast.error("Vui lòng nhập Tên Kế hoạch và Mục tiêu tổng quát trước khi sinh tự động.");
      return;
    }

    setIsAiProcessing(true);
    try {
      // Lấy dữ liệu tổ chức và chức danh
      const orgTree = await organizationApi.getTree();
      const { items: jobTitles } = await organizationApi.getJobTitles();

      const orgContext = orgTree.map(o => o.name).join(', ');
      const rolesContext = jobTitles.map(r => r.name).join(', ');

      const parsed = await aiApi.generateMasterPlanTasks({
        framework,
        planTitle,
        planObjective,
        orgContext,
        rolesContext
      });

      if (Array.isArray(parsed)) {
        const aiItems: TargetPlanItem[] = parsed.map((item: any, index: number) => {
          // Tìm rankId tương ứng với rankType AI trả về, nếu không có thì lấy 0 (Tất cả)
          const matchedRank = state.ranks.find((r: any) =>
            r.name.toLowerCase().includes((item.rankType || '').toLowerCase()) ||
            (item.rankType || '').toLowerCase().includes(r.name.toLowerCase())
          );

          return {
            id: `ai-${Date.now()}-${index}`,
            title: item.title || '',
            framework: framework,
            perspective: item.perspective || 'DIGITAL_TRANSFORM',
            legalBasis: item.legalBasis || 'N/A',
            metricFactor: item.metricFactor || 10,
            targetValue: item.targetValue || 100,
            unit: item.unit || '%',
            supervisor: item.supervisor || 'N/A',
            rankType: matchedRank ? matchedRank.code : (item.rankType || 'ALL'),
            rankId: matchedRank ? matchedRank.id : 0,
            aiStatus: 'RECOMMENDED'
          };
        });
        setItems(aiItems);
        toast.success("AI đã sinh thành công danh mục chỉ tiêu!");
      } else {
        throw new Error("Dữ liệu trả về không phải là mảng JSON");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi sinh tự động: " + (error.message || "Không xác định"));
    } finally {
      setIsAiProcessing(false);
    }
  };

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
      rankType: newRankId > 0 ? state.ranks.find((r: any) => r.id === newRankId)?.code || 'ALL' : 'ALL',
      rankId: newRankId,
      aiStatus: 'CUSTOM'
    };

    setItems([...items, newItem]);
    setNewTitle('');
    toast.success('Đã thêm chỉ tiêu mới');
  };

  const handlePublish = async () => {
    if (items.length === 0) {
      toast.error('Cần ít nhất 1 chỉ tiêu để ban hành kế hoạch!');
      return;
    }
    const totalWeight = items.reduce((sum, item) => sum + item.metricFactor, 0);
    if (framework === 'BSC_KPI' && totalWeight !== 100) {
      toast.error('Trọng số BSC KPI chưa đạt 100%. Vui lòng điều chỉnh!');
      return;
    }

    try {
      const payload = {
        title: planTitle.trim() || `Kế hoạch ${framework} - Quý ${Math.floor(new Date().getMonth() / 3) + 1}/${new Date().getFullYear()}`,
        type: framework,
        tasks: items.map(item => ({
          title: item.title,
          description: `Góc độ: ${item.perspective}\nĐơn vị tính: ${item.unit}\nCăn cứ pháp lý: ${item.legalBasis || 'Không có'}`,
          weight: item.metricFactor,
          targetValue: item.targetValue,
          unit: item.unit,
          supervisor: item.supervisor,
          rankCode: item.rankType,
          rankId: item.rankId,
        }))
      };

      await createMasterPlan(payload);
      toast.success(`Đã ban hành kế hoạch ${framework} thành công!`);

      actions.refreshPlans();
      actions.setMode("idle");
    } catch (error) {
      toast.error('Lỗi khi ban hành kế hoạch');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tạo mới Kế hoạch Tổng thể</h2>
          <p className="text-sm text-slate-500">Thiết lập cấu trúc và phân rã các chỉ tiêu thực thi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => actions.setMode("idle")}>Hủy</Button>
          <Button onClick={handlePublish} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <ClipboardCheck className="w-4 h-4 mr-2" /> Ban hành Kế hoạch
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-6">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Tên Kế hoạch</label>
            <input
              type="text"
              value={planTitle}
              onChange={e => setPlanTitle(e.target.value)}
              placeholder="VD: Kế hoạch Chuyển đổi số 2026..."
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block">Mục tiêu tổng quát</label>
            <input
              type="text"
              value={planObjective}
              onChange={e => setPlanObjective(e.target.value)}
              placeholder="VD: Hoàn thành 100% dịch vụ công trực tuyến..."
              className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(['BSC_KPI', 'OKRS', 'OGSM', 'MBO'] as ManagementFramework[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setFramework(mode); setItems([]); }}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${framework === mode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
            >
              Mô hình {mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-indigo-900 text-sm">AI Engine Phân rã Chỉ tiêu</h4>
            <p className="text-xs text-indigo-700/70 mt-1">Hỗ trợ tự động tạo danh mục mục tiêu theo chuẩn {framework}</p>
          </div>
          <Button
            onClick={handleAiGenerateFramework}
            disabled={isAiProcessing}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" /> {isAiProcessing ? "Đang xử lý..." : "Sinh tự động"}
          </Button>
        </div>

        <form onSubmit={handleAddItem} className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FolderPlus className="w-4 h-4 text-indigo-600" /> Thêm chỉ tiêu thủ công
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Nội dung chỉ tiêu / Hành động</label>
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Ngạch / Đối tượng phân bổ</label>
              <select
                value={newRankId}
                onChange={e => setNewRankId(Number(e.target.value))}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value={0}>Tất cả đối tượng</option>
                {state.ranks.map((rank: any) => (
                  <option key={rank.id} value={rank.id}>{rank.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                {framework === 'BSC_KPI' ? 'Trọng số (%)' : 'Mức độ ưu tiên'}
              </label>
              <input
                type="number"
                value={newMetricFactor}
                onChange={e => setNewMetricFactor(Number(e.target.value))}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm font-mono text-center"
                required
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Mục tiêu</label>
              <input
                type="number"
                value={newTargetValue}
                onChange={e => setNewTargetValue(Number(e.target.value))}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm font-mono text-center"
                required
              />
            </div>
            <div className="md:col-span-4">
              <label className="text-xs font-bold text-slate-700 mb-1.5 block">Đơn vị tính</label>
              <input
                type="text"
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                className="w-full h-10 border border-slate-200 rounded-lg px-3 text-sm text-center bg-slate-50"
                required
              />
            </div>
            <div className="md:col-span-12 text-right mt-2">
              <Button type="submit" variant="secondary">Thêm vào Kế hoạch</Button>
            </div>
          </div>
        </form>

        {items.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-sm text-slate-800">Danh mục chỉ tiêu</h4>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="p-3">Nội dung</th>
                  <th className="p-3 text-center">Ngạch</th>
                  <th className="p-3 text-center">Định mức</th>
                  <th className="p-3 text-center">Mục tiêu</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-800">{item.title}</td>
                    <td className="p-3 text-center text-xs font-mono bg-indigo-50/50 text-indigo-700">
                      {item.rankType}
                    </td>
                    <td className="p-3 text-center font-mono">{item.metricFactor}</td>
                    <td className="p-3 text-center font-mono font-bold text-indigo-600">{item.targetValue} {item.unit}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
