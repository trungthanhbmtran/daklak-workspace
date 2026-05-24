import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users, Clock, Settings2, Target, Wand2, Loader2 } from "lucide-react";

export interface TaskItemData {
  title: string;
  description: string;
  priority: string;
  assigneeCode: string;
  dueDate: string;
  baseScore: number | string;
  weight: number | string;
  scoringMethod: string;
  difficulty: string;
  difficultyMultiplier: number | string;
  bonusThresholdDays: number | string;
  bonusPerDay: number | string;
  penaltyPerDay: number | string;
  supervisorCode: string;
  isKpiLocked: boolean;
  kpiCriteriaId: number | null;
}

interface PlanTaskConfigListProps {
  tasks: TaskItemData[];
  uiLabels: { tab2: string; taskPrefix: string; taskTitle: string };
  criteriaLibrary: any[];
  onAddTask: () => void;
  onRemoveTask: (index: number) => void;
  onTaskChange: (index: number, field: string, value: any) => void;
  onApplyKpiCriteria: (taskIndex: number, criteriaId: string) => void;
  onOpenAssigneeModal: (index: number) => void;
  onImportExcel?: () => void;
  isGeneratingAI?: boolean;
  onGenerateWithAI?: () => void;
}

export function PlanTaskConfigList({
  tasks,
  uiLabels,
  criteriaLibrary,
  onAddTask,
  onRemoveTask,
  onTaskChange,
  onApplyKpiCriteria,
  onOpenAssigneeModal,
  onImportExcel,
  isGeneratingAI,
  onGenerateWithAI,
}: PlanTaskConfigListProps) {
  return (
    <>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{uiLabels.tab2} & Cấu hình KPI</h2>
          <p className="text-slate-500 font-medium">Thiết lập các {uiLabels.taskTitle}, giao việc và cài đặt công thức tính điểm.</p>
        </div>
        <div className="flex gap-2">
          {onGenerateWithAI && (
            <Button 
              onClick={onGenerateWithAI} 
              disabled={isGeneratingAI}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
            >
              {isGeneratingAI ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang phân tích...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Nhờ AI Phân việc</>
              )}
            </Button>
          )}
          {onImportExcel && (
            <Button onClick={onImportExcel} variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 rounded-xl">
              Import Excel
            </Button>
          )}
          <Button onClick={onAddTask} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200">
            <Plus className="w-4 h-4 mr-2" /> Thêm thủ công
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {tasks.map((task, idx) => (
          <Card key={idx} className="border-0 shadow-lg bg-white rounded-2xl overflow-visible relative group border-l-4 border-l-indigo-500">
            <Button
              variant="ghost" size="icon"
              className="absolute -top-3 -right-3 h-8 w-8 bg-white border border-slate-200 text-rose-500 rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => onRemoveTask(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-black px-2 py-1 rounded-md">{uiLabels.taskPrefix} {idx + 1}</span>
                    <h4 className="font-bold text-slate-800">{uiLabels.taskTitle}</h4>
                  </div>

                  <div className="space-y-4">
                    <Input
                      placeholder={`VD: Mô tả ${uiLabels.taskTitle}...`}
                      value={task.title}
                      onChange={e => onTaskChange(idx, 'title', e.target.value)}
                      className="h-12 text-base font-semibold bg-slate-50/50 rounded-xl"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Người thực hiện (Assignee)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={task.assigneeCode}
                            readOnly
                            placeholder="Chọn nhân sự..."
                            className="h-10 bg-slate-50 cursor-pointer"
                            onClick={() => onOpenAssigneeModal(idx)}
                          />
                          <Button variant="outline" onClick={() => onOpenAssigneeModal(idx)} className="h-10 px-3 shrink-0">Chọn</Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Hạn chót (Deadline)
                        </Label>
                        <Input type="date" value={task.dueDate} onChange={e => onTaskChange(idx, 'dueDate', e.target.value)} className="h-10 bg-slate-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 bg-slate-50/50 rounded-r-2xl border-l border-slate-100 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-800">Cấu hình tính điểm (KPI)</h4>
                    </div>
                    <Select value={task.kpiCriteriaId?.toString() || ""} onValueChange={(val) => onApplyKpiCriteria(idx, val)}>
                      <SelectTrigger className="h-8 text-xs bg-white border-indigo-200 text-indigo-700 font-semibold w-[200px]">
                        <SelectValue placeholder="Bắt buộc chọn từ thư viện" />
                      </SelectTrigger>
                      <SelectContent>
                        {criteriaLibrary.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {task.kpiCriteriaId ? (
                    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Settings2 className="w-4 h-4 text-emerald-500" />
                        <span>Phương pháp: <strong className="text-slate-800">{task.scoringMethod === 'MANUAL' ? 'Đánh giá thủ công' : task.scoringMethod === 'AUTO_DEADLINE' ? 'Theo tiến độ' : 'Theo kết quả'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Target className="w-4 h-4 text-amber-500" />
                        <span>Điểm chuẩn: <strong className="text-slate-800">{task.baseScore}</strong> | Trọng số: <strong className="text-slate-800">{task.weight}%</strong> | Độ khó: <strong className="text-slate-800">{task.difficulty} (x{task.difficultyMultiplier})</strong></span>
                      </div>
                      {(Number(task.bonusPerDay) > 0 || Number(task.penaltyPerDay) > 0) && (
                        <div className="bg-slate-50 rounded-lg p-2 mt-2 flex flex-col gap-1 text-xs font-medium">
                          {Number(task.bonusPerDay) > 0 && <span className="text-emerald-600">Thưởng: +{task.bonusPerDay}đ/ngày (Trước {task.bonusThresholdDays} ngày)</span>}
                          {Number(task.penaltyPerDay) > 0 && <span className="text-rose-600">Phạt: -{task.penaltyPerDay}đ/ngày trễ</span>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs italic bg-white rounded-xl border border-dashed border-slate-200">
                      Vui lòng chọn tiêu chí đánh giá từ thư viện do cấp trên ban hành.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">Chưa có {uiLabels.taskTitle} nào</h3>
            <p className="text-slate-500 mb-4">Hãy thêm các phân rã cấu trúc để thực hiện Kế hoạch.</p>
            <Button onClick={onAddTask} variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <Plus className="w-4 h-4 mr-2" /> Thêm ngay
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
