/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, MessageSquareX, UsersIcon } from "lucide-react";
import { useRespondTask, useRequestCoordination } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";

interface TaskRespondDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  action: "REJECT" | "REQUEST_COORDINATION" | null;
}

export function TaskRespondDialog({ open, onOpenChange, taskId, action }: TaskRespondDialogProps) {
  const [reason, setReason] = useState("");
  const [leadCode, setLeadCode] = useState("");
  const [coordinators, setCoordinators] = useState<{id: string, name: string}[]>([]);

  // ── Lấy danh sách nhân viên ──
  const { data: employeesData } = useHrmEmployeesList({ pageSize: 100, assignableOnly: true });
  const employees = (employeesData as any)?.data ?? [];

  const respondTask = useRespondTask(taskId);
  const requestCoordination = useRequestCoordination(taskId);
  const isPending = respondTask.isPending || requestCoordination.isPending;

  const handleAddCoordinator = (value: string) => {
    const emp = employees.find((e: any) => e.employeeCode === value);
    const name = emp ? `👤 ${emp.fullName}` : value;
    if (!coordinators.find(c => c.id === value)) {
      setCoordinators([...coordinators, { id: value, name }]);
    }
  };

  const removeCoordinator = (id: string) => {
    setCoordinators(coordinators.filter(c => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (action === "REJECT") {
        if (!reason.trim()) return;
        await respondTask.mutateAsync({ action: "REJECT", rejectReason: reason });
      } else if (action === "REQUEST_COORDINATION") {
        if (!reason.trim()) return;
        await requestCoordination.mutateAsync({
          message: reason,
          coordinatorCodes: coordinators.map(c => c.id),
          ...(leadCode ? { leadCode } : {}),
        });
      }
      onOpenChange(false);
      setReason("");
      setLeadCode("");
      setCoordinators([]);
    } catch {
      // handled
    }
  };

  if (!action) return null;
  const isReject = action === "REJECT";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isPending) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isReject ? <MessageSquareX className="w-5 h-5 text-red-500" /> : <UsersIcon className="w-5 h-5 text-blue-500" />}
            {isReject ? "Từ chối nhận việc" : "Xin phối hợp xử lý"}
          </DialogTitle>
          <DialogDescription>
            {isReject ? "Vui lòng nhập lý do từ chối công việc này để cấp trên xem xét." : "Vui lòng nhập lý do và chọn những cá nhân cần phối hợp để thực hiện công việc này."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-3">
            <Label>
              {isReject ? "Lý do từ chối" : "Lý do / Nội dung xin phối hợp"} <span className="text-red-500">*</span>
            </Label>
            <Textarea
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập nội dung chi tiết..."
              className="min-h-[100px]"
            />
          </div>

          {!isReject && (
            <>
              <div className="space-y-3">
                <Label>Người chủ trì phối hợp (Nếu có)</Label>
                <Select value={leadCode} onValueChange={setLeadCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn người chủ trì..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {employees.map((emp: any) => (
                        <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                          👤 {emp.fullName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Thêm người phối hợp</Label>
                <Select onValueChange={handleAddCoordinator} value={undefined}>
                  <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200">
                    <SelectValue placeholder="+ Chọn người / phòng ban phối hợp..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {employees.filter((emp: any) => !coordinators.find(c => c.id === emp.employeeCode)).map((emp: any) => (
                        <SelectItem key={emp.employeeCode} value={emp.employeeCode}>
                          👤 {emp.fullName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {coordinators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 bg-slate-50 p-3 rounded-md border border-slate-100">
                    {coordinators.map(c => (
                      <Badge key={c.id} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 bg-white border shadow-sm">
                        {c.name}
                        <button
                          type="button"
                          onClick={() => removeCoordinator(c.id)}
                          className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending || !reason.trim()} className={isReject ? "bg-red-600 hover:bg-red-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isReject ? "Từ chối" : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
