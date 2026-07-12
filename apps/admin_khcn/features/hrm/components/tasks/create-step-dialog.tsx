"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
}

export function CreateStepDialog({ open, onOpenChange, taskId }: CreateStepDialogProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic lưu bước mới sẽ ở đây
    alert(`Đã thêm bước vào công việc ${taskId}:\n- Tiêu đề: ${title}`);
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Thêm bước thực hiện (Checklist)</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên bước / Công việc cần làm <span className="text-red-500">*</span></label>
            <Input 
              required 
              placeholder="VD: Khảo sát thực trạng..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huỷ bỏ</Button>
            <Button type="submit">Thêm bước</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
