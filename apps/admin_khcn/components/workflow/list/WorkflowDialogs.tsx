/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type WorkflowModuleOption = { id: string; code: string; name: string };

/** Danh mục nghiệp vụ có thể gắn quy trình. Cache 5 phút vì ít thay đổi. */
export function useWorkflowModuleOptions() {
  const query = useQuery({
    queryKey: ["workflow", "modules"],
    queryFn: () => workflowApi.getModules(),
    staleTime: 5 * 60_000,
  });
  const modules: WorkflowModuleOption[] = Array.isArray(query.data) ? query.data : [];
  const getModuleName = (code?: string | null) => {
    // Mã có hậu tố _OLD_ là phiên bản đã bị thay thế — không coi là đang áp dụng.
    if (!code || code.includes("_OLD_")) return null;
    return modules.find((m) => m.code === code)?.name ?? code;
  };
  return { modules, getModuleName, isLoading: query.isLoading };
}

const errorMessage = (e: any, fallback: string) => e?.response?.data?.message || fallback;

interface TestRunDialogProps {
  workflow: Workflow | null;
  onClose: () => void;
  onStarted?: () => void;
}

export function WorkflowTestRunDialog({ workflow, onClose, onStarted }: TestRunDialogProps) {
  const [context, setContext] = useState("{\n  \n}");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (workflow) setContext("{\n  \n}");
  }, [workflow]);

  const handleStart = async () => {
    if (!workflow) return;
    let parsed: Record<string, unknown> = {};
    try {
      if (context.trim()) parsed = JSON.parse(context);
    } catch {
      toast.error("Dữ liệu đầu vào (JSON) không hợp lệ");
      return;
    }
    setIsRunning(true);
    try {
      await workflowApi.start(workflow.id, parsed);
      toast.success("Khởi chạy quy trình thành công!");
      onStarted?.();
      onClose();
    } catch (e) {
      toast.error(errorMessage(e, "Lỗi khi khởi chạy quy trình"));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog open={!!workflow} onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chạy thử quy trình</DialogTitle>
          <DialogDescription>
            Khởi chạy thử nghiệm <strong>{workflow?.name}</strong>. Biến đầu vào nhập dưới dạng JSON.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="workflow-test-context">Dữ liệu đầu vào (JSON)</Label>
          <Textarea
            id="workflow-test-context"
            placeholder='{"key": "value"}'
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="h-32 font-mono text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRunning}>
            Hủy
          </Button>
          <Button id="workflow-test-run-submit" onClick={handleStart} disabled={isRunning}>
            {isRunning ? "Đang xử lý..." : "Bắt đầu chạy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ApplyModuleDialogProps {
  workflow: Workflow | null;
  modules: WorkflowModuleOption[];
  onClose: () => void;
  onApplied?: () => void;
}

export function WorkflowApplyModuleDialog({ workflow, modules, onClose, onApplied }: ApplyModuleDialogProps) {
  const [moduleCode, setModuleCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workflow) setModuleCode(modules[0]?.code ?? "");
  }, [workflow, modules]);

  const handleApply = async () => {
    if (!workflow || !moduleCode) return;
    setIsSaving(true);
    try {
      await workflowApi.applyModule(workflow.id, moduleCode);
      toast.success("Đã áp dụng và kích hoạt quy trình thành công!");
      onApplied?.();
      onClose();
    } catch (e) {
      toast.error(errorMessage(e, "Lỗi khi áp dụng quy trình"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={!!workflow} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Áp dụng nghiệp vụ</DialogTitle>
          <DialogDescription>
            Chọn luồng nghiệp vụ để áp dụng quy trình <strong>{workflow?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label>Luồng nghiệp vụ</Label>
          <Select value={moduleCode} onValueChange={setModuleCode}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn nghiệp vụ..." />
            </SelectTrigger>
            <SelectContent>
              {modules.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  Chưa có nghiệp vụ nào
                </SelectItem>
              ) : (
                modules.map((m) => (
                  <SelectItem key={m.code} value={m.code}>
                    {m.name} <span className="ml-2 text-xs text-muted-foreground">{m.code}</span>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button id="workflow-apply-module-submit" onClick={handleApply} disabled={isSaving || !moduleCode}>
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
