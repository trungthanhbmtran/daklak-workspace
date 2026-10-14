/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/typography";
import { Label } from "@/components/ui/label";
import { ListChecksIcon, CheckCircle2, Loader2 } from "lucide-react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useCreateStep } from "../../hooks/useTasks";
import { useUser } from "@/hooks/useUser";

interface CreateStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
}

export function CreateStepDialog({ open, onOpenChange, task }: CreateStepDialogProps) {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [baseScore, setBaseScore] = useState<number | "">("");
  const [assigneeCode, setAssigneeCode] = useState<string>("");

  const createStep = useCreateStep(Number(task?.id));
  const isPending = createStep.isPending;

  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100 });
  const employees = (employeesData as any)?.data ?? [];

  const resetForm = () => { setTitle(""); setBaseScore(""); setAssigneeCode(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createStep.mutateAsync({ 
        title: title.trim(),
        baseScore,
        assigneeCode: assigneeCode && assigneeCode !== "UNASSIGNED" ? assigneeCode : undefined,
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
              Tên bước / Công việc cần làm <Text as="span" className="text-red-500">*</Text>
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

          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Người thực hiện (Phân việc)
            </Label>
            <Select value={assigneeCode} onValueChange={setAssigneeCode} disabled={isPending}>
              <SelectTrigger className="w-full bg-white h-11 focus:ring-indigo-500">
                <SelectValue placeholder="Chọn người thực hiện bước này..." />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {user?.employeeCode && (
                  <SelectItem value={user.employeeCode} className="font-medium text-purple-700 dark:text-purple-300">
                    👤 Bản thân tôi phụ trách ({user.fullName || user.employeeCode})
                  </SelectItem>
                )}
                {task?.assigneeCode && task.assigneeCode !== user?.employeeCode && (
                  <SelectItem value={task.assigneeCode} className="font-medium text-blue-700 dark:text-blue-300">
                    🎯 Người chủ trì công việc ({task.assigneeName || task.assigneeCode})
                  </SelectItem>
                )}
                <SelectItem value="UNASSIGNED" className="text-slate-500 italic">
                  -- Chưa phân công cụ thể --
                </SelectItem>
                <SelectGroup>
                  <SelectLabel className="text-xs text-slate-400 uppercase font-semibold">Cá nhân khác</SelectLabel>
                  {employees
                    .filter((emp: any) => emp.employeeCode !== user?.employeeCode && emp.employeeCode !== task?.assigneeCode)
                    .map((emp: any) => (
                      <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                        👤 {emp.fullName} ({emp.jobTitleName || emp.employeeCode})
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Text variant="small" className="text-slate-500 font-normal">
              Bạn có thể tự phụ trách, giao cho người chủ trì hoặc phân công cho cá nhân khác.
            </Text>
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
