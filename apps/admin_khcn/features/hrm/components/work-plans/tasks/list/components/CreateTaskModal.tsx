"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ClipboardList, Calendar, Flag } from 'lucide-react';
import { hrmTasksApi } from '@/features/hrm/api';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: (created?: boolean) => void;
}

export function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.title.trim()) return toast.error('Vui lòng nhập tên công việc');

    setIsSubmitting(true);
    try {
      // Create root task
      await hrmTasksApi.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        assigneeCode: 'UNASSIGNED',
        status: 'TODO',
      });

      toast.success(`Đã khởi tạo: ${form.title}`);
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] });
      onClose(true);
    } catch {
      toast.error('Lỗi khi khởi tạo công việc');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-0">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Khởi tạo công việc mới
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Khởi tạo đầu mục công việc gốc mới trên hệ thống. Công việc này sẽ được đưa vào danh sách chờ phân công.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Tên công việc <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên công việc cụ thể..."
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="h-11 font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus-visible:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mô tả</label>
              <Textarea
                placeholder="Chi tiết yêu cầu, tiêu chí hoàn thành..."
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="min-h-[80px] text-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Flag className="w-3 h-3" /> Ưu tiên
                </label>
                <Select value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))}>
                  <SelectTrigger className="h-11 font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="LOW" className="font-bold">🟢 Thấp</SelectItem>
                    <SelectItem value="MEDIUM" className="font-bold">🟡 Trung bình</SelectItem>
                    <SelectItem value="HIGH" className="font-bold">🔴 Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Hạn hoàn thành
                </label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="h-11 font-medium border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" onClick={() => onClose()} className="flex-1 h-11 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !form.title.trim()}
              className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
            >
              {isSubmitting ? 'Đang tạo...' : '+ Khởi tạo công việc'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
