"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Calendar, Flag } from 'lucide-react';
import { hrmTasksApi } from '@/features/hrm/api';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';

interface SubTaskModalProps {
  isOpen: boolean;
  onClose: (created?: boolean) => void;
  parentTask: any;        // Task cha — người hiện tại là assignee
  planId?: number;        // Tự động propagate nếu không có
}

export function SubTaskModal({ isOpen, onClose, parentTask, planId }: SubTaskModalProps) {
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Vui lòng nhập tên nhiệm vụ');

    setIsSubmitting(true);
    try {
      const isRootTask = !parentTask?.id;

      if (isRootTask) {
        const finalPlanId = (planId || parentTask?.planId);
        // Tạo đầu việc gốc — không có parentId, chỉ có planId
        const { hrmTasksApi } = await import('@/features/hrm/api');
        await hrmTasksApi.create({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          assigneeCode: 'UNASSIGNED',
          planId: finalPlanId,
          status: 'TODO',
        });
      } else {
        const finalPlanId = (planId || parentTask?.planId);
        // Tạo nhiệm vụ con dưới task cha
        await hrmTasksApi.createSubTask(parentTask.id, {
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          priority: form.priority,
          dueDate: form.dueDate || undefined,
          planId: finalPlanId,
        });
      }

      toast.success(`Đã thêm: ${form.title}`);
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      if (parentTask?.id) {
        qc.invalidateQueries({ queryKey: hrmKeys.taskSubtasks(parentTask.id) });
        // Optional: also root rootTaskId if it's different, but invalidating tasks() is enough.
      }
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] });
      onClose(true);
    } catch {
      toast.error('Lỗi khi tạo nhiệm vụ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!parentTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-violet-600" />
              </div>
              Thêm nhiệm vụ con
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-700">Dưới:</span> {parentTask.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Tên nhiệm vụ <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên nhiệm vụ cụ thể..."
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="h-10 font-medium border-slate-200 focus-visible:ring-violet-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Mô tả</label>
              <Textarea
                placeholder="Chi tiết yêu cầu, tiêu chí hoàn thành..."
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="min-h-[80px] text-sm border-slate-200 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Ưu tiên
                </label>
                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="h-10 font-medium border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">🟢 Thấp</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                    <SelectItem value="HIGH">🔴 Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Hạn hoàn thành
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="h-10 font-medium border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => onClose()} className="flex-1 h-10 text-slate-600 rounded-xl">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.title.trim()}
              className="flex-1 h-10 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
            >
              {isSubmitting ? 'Đang tạo...' : '+ Thêm nhiệm vụ'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
