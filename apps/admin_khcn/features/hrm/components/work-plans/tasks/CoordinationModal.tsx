'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send, Users, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { hrmTasksApi } from '../../../api';

interface CoordinationModalProps {
  task: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/**
 * Dialog xin phối hợp: gửi yêu cầu lên LÃNH ĐẠO TRỰC TIẾP (người đã giao task).
 * Người thực hiện KHÔNG tự chọn người phối hợp.
 * Lãnh đạo nhận thông báo và sẽ vào phân rã thêm công việc nếu cần.
 */
export function CoordinationModal({ task, open, onOpenChange, onSuccess }: CoordinationModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!task) return;
    setIsSubmitting(true);
    try {
      await hrmTasksApi.requestCoordination(task.id.toString(), {
        message: message.trim() || undefined,
      });
      toast.success('Đã gửi yêu cầu phối hợp đến lãnh đạo!');
      setMessage('');
      onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Lỗi khi gửi yêu cầu phối hợp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!isSubmitting) { setMessage(''); onOpenChange(o); } }}>
      <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-100 dark:border-amber-800/30">
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-amber-900 dark:text-amber-100">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            Xin phối hợp
          </DialogTitle>
          {task && (
            <p className="text-sm text-amber-700/80 dark:text-amber-300/80 mt-1 line-clamp-1">
              📋 {task.title}
            </p>
          )}
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Thông tin luồng nghiệp vụ */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/40">
            <ArrowUpCircle className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-bold mb-1">Yêu cầu sẽ được gửi đến lãnh đạo trực tiếp</p>
              <p className="text-blue-600/80 dark:text-blue-400/80">
                {task?.assignerCode
                  ? <>Người nhận: <span className="font-semibold">{task?.assignerName || task?.assignerCode}</span></>
                  : 'Lãnh đạo sẽ nhận thông báo và quyết định phân công thêm người hỗ trợ.'}
              </p>
            </div>
          </div>

          {/* Ô nhập lý do / nội dung yêu cầu */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nội dung yêu cầu <span className="text-slate-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mô tả lý do cần phối hợp, khó khăn đang gặp phải..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => { setMessage(''); onOpenChange(false); }}
            disabled={isSubmitting}
            className="rounded-xl h-10"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl h-10 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Gửi yêu cầu phối hợp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
