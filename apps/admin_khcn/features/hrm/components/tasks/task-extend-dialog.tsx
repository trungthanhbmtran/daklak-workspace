import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useExtendTask } from "../../hooks/useTasks";
import { hrmKeys } from "../../keys";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TaskExtendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  currentDueDate?: string | null;
}

export function TaskExtendDialog({ open, onOpenChange, taskId, currentDueDate }: TaskExtendDialogProps) {
  const qc = useQueryClient();
  const [newDueDate, setNewDueDate] = useState<string>(currentDueDate ? new Date(currentDueDate).toISOString().slice(0, 16) : "");
  const [reason, setReason] = useState("");

  const extendMutation = useExtendTask();

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!newDueDate) {
      toast.error("Vui lòng chọn thời hạn mới");
      return;
    }
    // Convert to ISO string
    const dueDateIso = new Date(newDueDate).toISOString();
    
    extendMutation.mutate(
      { id: taskId, payload: { dueDate: dueDateIso, reason } },
      { onSuccess: handleSuccess }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gia hạn thời gian xử lý</DialogTitle>
          <DialogDescription>
            Thay đổi thời hạn hoàn thành công việc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Thời hạn mới</label>
            <input
              type="datetime-local"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do gia hạn</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nhập lý do gia hạn (không bắt buộc)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={extendMutation.isPending}>
            {extendMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
