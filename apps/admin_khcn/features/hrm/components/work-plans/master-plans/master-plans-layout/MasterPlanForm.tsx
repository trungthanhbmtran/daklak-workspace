"use client";

import React, { useState } from 'react';
import {
  FolderPlus, Sparkles, GitMerge, Trash2, ClipboardCheck, BrainCircuit, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useMasterPlanContext, type ManagementFramework, type GovPerspective } from './MasterPlanContext';
import { useMutation } from '@tanstack/react-query';
import { hrmPlansApi } from '@/features/hrm/api';
import { aiApi } from '@/features/hrm/api/ai.api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { organizationApi } from '@/features/system-admin/organization/api';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

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
  const [aiStep, setAiStep] = useState(0); // 0: idle, 1: loading, 2: success
  const [feasibilityInfo, setFeasibilityInfo] = useState<any>(null);
  const { mutateAsync: createMasterPlan } = useMutation({
    mutationFn: async (payload: any) => hrmPlansApi.create(payload)
  });

  const [items, setItems] = useState<TargetPlanItem[]>([]);

  const [planTitle, setPlanTitle] = useState('');
  const [planObjective, setPlanObjective] = useState('');

  const { data: units = [] } = useGetCategoryByGroup('UNIT');

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

    setAiStep(1);
    try {
      const initRes = await aiApi.evaluatePlanFeasibility({
        title: planTitle,
        objective: planObjective,
        durationDays: 30, // Default duration
        type: 'MASTER_PLAN',
        orgContext: 'Văn phòng Sở, Thanh tra, Phòng Kế hoạch Tài chính, Quản lý Khoa học',
        rolesContext: 'Chuyên viên, Lãnh đạo Sở, Trưởng phòng'
      });

      if (initRes.jobId && initRes.status === 'PROCESSING') {
        // Start polling
        const intervalId = setInterval(async () => {
          try {
            const jobStatus = await aiApi.getAiJobStatus(initRes.jobId);
            if (jobStatus.status === 'COMPLETED') {
              clearInterval(intervalId);
              const result = jobStatus.result || jobStatus.data;
              
              const feasibility = result.find((r: any) => r.type === 'FEASIBILITY_ANALYSIS');
              setFeasibilityInfo(feasibility);

              const aiTasks = result.filter((r: any) => r.type === 'TASK');

              if (aiTasks.length > 0) {
                const aiItems: TargetPlanItem[] = aiTasks.map((t: any, index: number) => {
                  const matchedRank = state.ranks.find((r: any) =>
                    r.name.toLowerCase().includes((t.assigneeRole || '').toLowerCase()) ||
                    (t.assigneeRole || '').toLowerCase().includes(r.name.toLowerCase())
                  );

                  return {
                    id: `ai-${Date.now()}-${index}`,
                    title: t.title || '',
                    framework: framework,
                    perspective: 'DIGITAL_TRANSFORM',
                    legalBasis: t.reasoning || 'N/A',
                    metricFactor: t.weight || 10,
                    targetValue: t.targetValue || 100,
                    unit: '%',
                    supervisor: 'N/A',
                    rankType: matchedRank ? matchedRank.code : (t.assigneeRole || 'ALL'),
                    rankId: matchedRank ? matchedRank.id : 0,
                    aiStatus: 'RECOMMENDED'
                  };
                });
                setItems(aiItems);
                toast.success("AI đã sinh thành công danh mục chỉ tiêu và đánh giá độ khả thi!");
              }
              setAiStep(2);
            } else if (jobStatus.status === 'FAILED') {
              clearInterval(intervalId);
              toast.error("Lỗi sinh tự động: " + (jobStatus.error || "Không xác định"));
              setAiStep(0);
            }
          } catch (pollErr) {
             // Silently ignore poll errors, might be intermittent network issue
             console.warn("Polling error", pollErr);
          }
        }, 3000); // Poll every 3 seconds
      } else {
        // Fallback if not async
        toast.error("Không thể khởi tạo tiến trình AI.");
        setAiStep(0);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi sinh tự động: " + (error.message || "Không xác định"));
      setAiStep(0);
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
          description: `Góc độ: ${item.perspective}\nĐơn vị tính: ${item.unit}\nCăn cứ pháp lý: ${item.legalBasis || 'Không có'}\nĐơn vị giám sát: ${item.supervisor || 'N/A'}`,
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
            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Tên Kế hoạch</Label>
            <Input
              value={planTitle}
              onChange={e => setPlanTitle(e.target.value)}
              placeholder="VD: Kế hoạch Chuyển đổi số 2026..."
              className="h-10 text-sm focus-visible:ring-indigo-500"
            />
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Mục tiêu tổng quát</Label>
            <Input
              value={planObjective}
              onChange={e => setPlanObjective(e.target.value)}
              placeholder="VD: Hoàn thành 100% dịch vụ công trực tuyến..."
              className="h-10 text-sm focus-visible:ring-indigo-500"
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
            <p className="text-xs text-indigo-700/70 mt-1">Phân tích khả năng thực thi và tự động tạo danh mục mục tiêu</p>
          </div>
          <Button
            onClick={handleAiGenerateFramework}
            disabled={aiStep === 1}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            {aiStep === 1 ? <><BrainCircuit className="w-4 h-4 mr-2 animate-pulse" /> Đang xử lý...</> : <><Sparkles className="w-4 h-4 mr-2" /> Phân tích & Sinh tự động</>}
          </Button>
        </div>

        {aiStep === 1 && (
            <div className="py-8 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-md font-bold text-slate-800">AI đang đối chiếu dữ liệu...</h3>
                <p className="text-slate-500 text-sm">Đang tính toán tỷ lệ khả thi và tối ưu nguồn lực nhân sự...</p>
              </div>
            </div>
        )}

        {aiStep === 2 && feasibilityInfo && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="flex-shrink-0 relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`${feasibilityInfo.score >= 70 ? 'text-emerald-500' : feasibilityInfo.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`} strokeDasharray={`${feasibilityInfo.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-700">{feasibilityInfo.score}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Đánh giá Tỷ lệ Khả thi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {feasibilityInfo.advice}
                  </p>
                </div>
              </div>
        )}

        <form onSubmit={handleAddItem} className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <FolderPlus className="w-4 h-4 text-indigo-600" /> Thêm chỉ tiêu thủ công
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Nội dung chỉ tiêu / Hành động</Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="h-10 text-sm focus-visible:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Ngạch / Đối tượng phân bổ</Label>
              <Select value={newRankId.toString()} onValueChange={v => setNewRankId(Number(v))}>
                <SelectTrigger className="h-10 text-sm bg-white focus:ring-indigo-500">
                  <SelectValue placeholder="Chọn Ngạch/Đối tượng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất cả đối tượng</SelectItem>
                  {state.congChucRanks.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Ngạch Công chức</SelectLabel>
                      {state.congChucRanks.map((rank: any) => (
                        <SelectItem key={rank.id} value={rank.id.toString()}>{rank.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {state.vienChucRanks.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Chức danh nghề nghiệp Viên chức</SelectLabel>
                      {state.vienChucRanks.map((rank: any) => (
                        <SelectItem key={rank.id} value={rank.id.toString()}>{rank.name}</SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs font-bold text-slate-700 mb-1.5 block">
                {framework === 'BSC_KPI' ? 'Trọng số (%)' : 'Mức độ ưu tiên'}
              </Label>
              <Input
                type="number"
                value={newMetricFactor}
                onChange={e => setNewMetricFactor(Number(e.target.value))}
                className="h-10 text-sm font-mono text-center focus-visible:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Mục tiêu</Label>
              <Input
                type="number"
                value={newTargetValue}
                onChange={e => setNewTargetValue(Number(e.target.value))}
                className="h-10 text-sm font-mono text-center focus-visible:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-4">
              <Label className="text-xs font-bold text-slate-700 mb-1.5 block">Đơn vị tính</Label>
              <Select value={newUnit} onValueChange={setNewUnit} required>
                <SelectTrigger className="h-10 text-sm bg-white focus:ring-indigo-500 text-center">
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u: any) => (
                    <SelectItem key={u.code} value={u.nameVi || u.name}>{u.nameVi || u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
