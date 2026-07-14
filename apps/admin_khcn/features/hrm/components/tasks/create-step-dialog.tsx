"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListChecksIcon, CheckCircle2, Loader2 } from "lucide-react";
import { useCreateStep } from "../../hooks/useTasks";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string | number;
}

export function CreateStepDialog({ open, onOpenChange, taskId }: CreateStepDialogProps) {
  const [title, setTitle] = useState("");
  const [baseScore, setBaseScore] = useState<number | "">("");

  const createStep = useCreateStep(Number(taskId));
  const isPending = createStep.isPending;

  const resetForm = () => { setTitle(""); setBaseScore(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createStep.mutateAsync({ 
        title: title.trim(),
        baseScore: baseScore === "" ? 0 : Number(baseScore)
      });
      resetForm();
      onOpenChange(false);
    } catch {
      // Lỗi đã xử lý trong hook (onError toast)
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) { resetForm(); onOpenChange(v); } }}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 pb-5 border-b bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <ListChecksIcon className="w-4 h-4" />
               </div>
               Thêm bước thực hiện (Checklist)
            </DialogTitle>
            <DialogDescription className="ml-10">
              Chia nhỏ công việc thành các bước cụ thể để dễ theo dõi và giám sát tiến độ.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tên bước / Công việc cần làm <span className="text-red-500">*</span>
            </Label>
            <Input 
              required 
              placeholder="VD: Khảo sát thực trạng, thu thập số liệu..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base h-11 transition-all focus-visible:ring-indigo-500 bg-white"
              autoFocus
              disabled={isPending}
            />
          </div>
          
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Điểm KPI (Tùy chọn)
            </Label>
            <Input 
              type="number"
              placeholder="Nhập điểm thưởng khi hoàn thành bước này" 
              value={baseScore}
              onChange={(e) => setBaseScore(e.target.value === "" ? "" : Number(e.target.value))}
              className="text-base h-11 transition-all focus-visible:ring-indigo-500 bg-white"
              disabled={isPending}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 sm:space-x-0">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => { resetForm(); onOpenChange(false); }} 
              disabled={isPending}
              className="hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Huỷ bỏ
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !title.trim()}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isPending ? "Đang lưu..." : "Lưu bước"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
