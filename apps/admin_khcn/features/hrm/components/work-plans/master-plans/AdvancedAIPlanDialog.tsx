'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { aiApi } from "../../../api/ai.api";
import { Loader2, BrainCircuit, Activity, CheckCircle2, AlertTriangle, Users } from "lucide-react";

interface AdvancedAIPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (planData: any) => void;
}

export function AdvancedAIPlanDialog({ isOpen, onClose, onSuccess }: AdvancedAIPlanDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    durationDays: '30'
  });

  const [aiResult, setAiResult] = useState<any[]>([]);

  const handleEvaluate = async () => {
    if (!formData.title || !formData.objective) return;

    setLoading(true);
    setStep(2); // Loading / Evaluating state
    try {
      const result = await aiApi.evaluatePlanFeasibility({
        title: formData.title,
        objective: formData.objective,
        durationDays: parseInt(formData.durationDays, 10),
        type: 'MASTER_PLAN',
        orgContext: 'Văn phòng Sở, Thanh tra, Phòng Kế hoạch Tài chính, Quản lý Khoa học',
        rolesContext: 'Chuyên viên, Lãnh đạo Sở, Trưởng phòng'
      });

      setAiResult(result);
      setStep(3); // Result state
    } catch (e) {
      console.error(e);
      // fallback
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Return data back to parent to save
    const tasks = aiResult.filter(r => r.type === 'TASK').map(t => ({
      title: t.title,
      description: t.reasoning,
      priority: t.priority,
      weight: t.weight,
      targetValue: t.targetValue,
      rankCode: t.assigneeRole
    }));

    onSuccess({
      title: formData.title,
      description: formData.objective,
      type: 'MASTER_PLAN',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + parseInt(formData.durationDays, 10) * 24 * 60 * 60 * 1000).toISOString(),
      tasks: tasks
    });

    onClose();
  };

  const feasibilityInfo = aiResult.find(r => r.type === 'FEASIBILITY_ANALYSIS');
  const taskList = aiResult.filter(r => r.type === 'TASK');

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && !loading && onClose()}>
      <DialogContent className="sm:max-w-[750px] bg-slate-50/90 backdrop-blur-xl border-white/50 shadow-2xl overflow-hidden rounded-3xl p-0">

        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Lập Kế Hoạch AI Nâng Cao</DialogTitle>
            <DialogDescription className="text-indigo-100 mt-1">
              Phân tích độ khả thi dựa trên lịch sử & Tự động tối ưu nguồn lực
            </DialogDescription>
          </div>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Tên công việc / Kế hoạch</Label>
                <Input
                  placeholder="Ví dụ: Triển khai Số hóa dữ liệu Khoa học"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Mục tiêu & Yêu cầu cụ thể</Label>
                <Textarea
                  placeholder="Mô tả các kết quả kỳ vọng..."
                  value={formData.objective}
                  onChange={e => setFormData({ ...formData, objective: e.target.value })}
                  className="bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-indigo-500 min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Thời gian yêu cầu hoàn thành (Ngày)</Label>
                <Input
                  type="number"
                  value={formData.durationDays}
                  onChange={e => setFormData({ ...formData, durationDays: e.target.value })}
                  className="bg-white rounded-xl shadow-sm border-slate-200 focus-visible:ring-indigo-500 w-1/3"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-800">AI đang đối chiếu dữ liệu...</h3>
                <p className="text-slate-500 text-sm">Tìm kiếm các Kế hoạch cũ cùng tính chất & thời gian...</p>
                <p className="text-slate-500 text-sm">Tính toán tỷ lệ khả thi và tối ưu nguồn lực nhân sự...</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="flex-shrink-0 relative w-20 h-20">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className={`${feasibilityInfo?.score >= 70 ? 'text-emerald-500' : feasibilityInfo?.score >= 50 ? 'text-amber-500' : 'text-rose-500'}`} strokeDasharray={`${feasibilityInfo?.score}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-700">{feasibilityInfo?.score}%</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Đánh giá Tỷ lệ Khả thi
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {feasibilityInfo?.advice}
                  </p>
                </div>
              </div>

              {/* Task List */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Phân việc đề xuất & Tối ưu nguồn lực
                </h4>
                <div className="max-h-[250px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {taskList.map((t, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{t.title}</span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md">Trọng số: {t.weight}%</span>
                      </div>
                      <div className="flex items-start gap-2 mt-3 text-xs bg-slate-50 p-2 rounded-lg">
                        <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-700">Đề xuất giao cho: {t.assigneeRole}</p>
                          <p className="text-slate-500 mt-1">{t.reasoning}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/80 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl font-semibold">
            Hủy bỏ
          </Button>
          {step === 1 && (
            <Button
              onClick={handleEvaluate}
              disabled={!formData.title || !formData.objective}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
            >
              Phân tích AI & Lập KH
            </Button>
          )}
          {step === 3 && (
            <Button
              onClick={handleCreate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
            >
              Duyệt & Tạo Kế hoạch này
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
