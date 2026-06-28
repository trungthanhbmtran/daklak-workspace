"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles, Calendar, Flag, UserPlus, Trash2, Split } from 'lucide-react';
import { hrmTasksApi } from '@/features/hrm/api';
import { aiApi } from '@/features/hrm/api/ai.api';
import { hrmApi } from '@/features/hrm/api/employees.api';

interface AiTaskBreakdownModalProps {
  isOpen: boolean;
  onClose: (created?: boolean) => void;
  parentTask: any;
  planId?: number;
}

interface GeneratedSubtask {
  id: string; // for UI key
  title: string;
  description: string;
  priority: string;
  dueDate: string;
  assigneeCode: string;
  reasoning: string;
}

export function AiTaskBreakdownModal({ isOpen, onClose, parentTask, planId }: AiTaskBreakdownModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedSubtask[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto generate when modal opens if list is empty
  useEffect(() => {
    if (isOpen && parentTask && generatedTasks.length === 0) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, parentTask]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedTasks([]);
    try {
      // 1. Lấy danh sách nhân sự làm context
      const empRes = await hrmApi.list({ pageSize: 50 });
      const employeesContext = (empRes.data || [])
        .map(emp => `${emp.fullName} (Mã: ${emp.employeeCode}, Chức danh: ${emp.jobTitle?.name || 'Không có'})`)
        .join('\n');

      // 2. Gọi AI API
      const resultList = await aiApi.generateSubTasksAssignment({
        parentTitle: parentTask.title,
        parentDescription: parentTask.description || '',
        employeesContext: employeesContext || 'Không có dữ liệu nhân sự'
      });

      if (!Array.isArray(resultList)) {
        throw new Error('AI trả về sai định dạng dữ liệu (không phải mảng)');
      }

      const tasksWithIds = resultList.map(t => ({
        ...t,
        id: Math.random().toString(36).substring(7)
      }));

      setGeneratedTasks(tasksWithIds);
      toast.success(`AI đã phân rã thành ${tasksWithIds.length} công việc con!`);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi gọi AI phân tích');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (generatedTasks.length === 0) return;

    setIsSubmitting(true);
    try {
      const finalPlanId = planId || parentTask?.planId;
      
      // Tạo tất cả các subtasks bằng Promise.all
      const promises = generatedTasks.map(task => 
        hrmTasksApi.createSubTask(parentTask.id, {
          title: task.title.trim(),
          description: task.reasoning ? `[Phân công bởi AI]: ${task.reasoning}\n\n${task.description || ''}` : task.description,
          priority: task.priority || 'MEDIUM',
          dueDate: task.dueDate || undefined,
          assigneeCode: task.assigneeCode || 'UNASSIGNED',
          planId: finalPlanId,
        })
      );

      await Promise.all(promises);

      toast.success(`Đã tạo thành công ${generatedTasks.length} công việc con!`);
      setGeneratedTasks([]);
      onClose(true);
    } catch (error) {
      toast.error('Lỗi khi lưu danh sách công việc');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeTask = (id: string) => {
    setGeneratedTasks(prev => prev.filter(t => t.id !== id));
  };

  if (!parentTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => {
      if (!v) {
        setGeneratedTasks([]);
        onClose();
      }
    }}>
      <DialogContent className="max-w-3xl bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-0 flex flex-col max-h-[90vh]">
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                AI Phân rã công việc
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerate} 
                disabled={isGenerating || isSubmitting}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/50"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Thử lại
              </Button>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="font-medium text-slate-700 dark:text-slate-300">Công việc gốc:</span> {parentTask.title}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 animate-pulse">
                AI đang phân tích và tìm kiếm nhân sự phù hợp...
              </p>
            </div>
          ) : generatedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <Split className="w-10 h-10 mb-3 text-slate-300" />
              <p className="font-medium text-sm">Chưa có dữ liệu phân rã.</p>
              <p className="text-xs mt-1">Bấm "Thử lại" để AI tiến hành phân tích.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedTasks.map((task, idx) => (
                <div key={task.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative group transition-all hover:border-indigo-300">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-start gap-3 pr-8">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{task.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Assignee */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-100 dark:border-indigo-800">
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{task.assigneeCode || 'UNASSIGNED'}</span>
                        </div>
                        
                        {/* Priority */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs font-medium border border-slate-100 dark:border-slate-700">
                          <Flag className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-slate-600 dark:text-slate-400">{task.priority === 'HIGH' ? 'Cao' : task.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}</span>
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs font-medium border border-slate-100 dark:border-slate-700">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">{task.dueDate}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Reasoning */}
                      {task.reasoning && (
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded-lg italic flex gap-1.5">
                          <span className="shrink-0">💡</span>
                          <span>{task.reasoning}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onClose()} className="flex-1 h-11 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || generatedTasks.length === 0 || isGenerating}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              {isSubmitting ? 'Đang tạo...' : `Xác nhận & Khởi tạo (${generatedTasks.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
