"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListChecksIcon, UserIcon, CheckCircle2 } from "lucide-react";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
}

export function CreateStepDialog({ open, onOpenChange, taskId }: CreateStepDialogProps) {
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic lưu bước mới sẽ ở đây
    alert(`Đã thêm bước vào công việc ${taskId}:\n- Tiêu đề: ${title}\n- Phụ trách: ${assignee}`);
    setTitle("");
    setAssignee("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              Chia nhỏ công việc thành các bước và phân công cho người chủ trì hoặc bên phối hợp.
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
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <UserIcon className="w-4 h-4 text-slate-400"/> Người / Đơn vị thực hiện <span className="text-red-500">*</span>
            </Label>
            <Select value={assignee} onValueChange={setAssignee} required>
              <SelectTrigger className="w-full bg-white dark:bg-slate-950 h-11 focus:ring-indigo-500 shadow-sm">
                <SelectValue placeholder="Chọn người phụ trách từ danh sách tham gia..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Chủ trì chính</SelectLabel>
                  <SelectItem value="EMP_MAIN">👤 Phạm Thị D (Người xử lý chính)</SelectItem>
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-xs text-slate-500 uppercase font-semibold">Bên phối hợp</SelectLabel>
                  <SelectItem value="EMP_COOR_1">👤 Lê Văn H (Cá nhân phối hợp)</SelectItem>
                  <SelectItem value="DEPT_COOR_1">🏢 P. Kế toán (Đơn vị phối hợp)</SelectItem>
                  <SelectItem value="DEPT_COOR_2">🏢 P. Tổ chức (Đơn vị phối hợp)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 sm:space-x-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-slate-200 dark:hover:bg-slate-800">
              Huỷ bỏ
            </Button>
            <Button type="submit" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
              <CheckCircle2 className="w-4 h-4" /> Lưu bước
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
