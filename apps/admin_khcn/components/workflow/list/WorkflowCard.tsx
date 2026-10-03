"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarClock,
  CheckCircle2,
  Edit2,
  GitBranch,
  Link2,
  MoreHorizontal,
  Play,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isWorkflowPublished, type Workflow } from "@/features/workflow/api";

export function WorkflowStatusPill({ workflow, className }: { workflow: Workflow; className?: string }) {
  const published = isWorkflowPublished(workflow);
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        published
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", published ? "bg-emerald-500" : "bg-amber-500")} />
      {published ? "Đang hoạt động" : "Bản nháp"}
    </Badge>
  );
}

export const formatWorkflowDate = (value?: string, pattern = "dd/MM/yyyy") => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, pattern, { locale: vi });
};

interface WorkflowCardProps {
  workflow: Workflow;
  appliedModuleName?: string | null;
  onOpen: (w: Workflow) => void;
  onEdit: (id: string) => void;
  onTestRun: (w: Workflow) => void;
  onApply: (w: Workflow) => void;
  onDelete: (id: string) => void;
}

export function WorkflowCard({
  workflow,
  appliedModuleName,
  onOpen,
  onEdit,
  onTestRun,
  onApply,
  onDelete,
}: WorkflowCardProps) {
  return (
    <article className="group relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      {/* Vùng bấm toàn thẻ để mở chi tiết; menu thao tác nằm trên lớp riêng */}
      <button
        type="button"
        id={`workflow-card-${workflow.id}`}
        onClick={() => onOpen(workflow)}
        className="absolute inset-0 z-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Xem chi tiết quy trình ${workflow.name}`}
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <GitBranch className="size-5" />
          </div>
          <div className="pointer-events-auto flex items-center gap-1">
            <WorkflowStatusPill workflow={workflow} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Thao tác">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(workflow.id)}>
                  <Edit2 className="size-4" /> Chỉnh sửa sơ đồ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTestRun(workflow)}>
                  <Play className="size-4" /> Chạy thử
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onApply(workflow)}>
                  <Link2 className="size-4" /> Áp dụng nghiệp vụ
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(workflow.id)}>
                  <Trash2 className="size-4" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{workflow.name}</h3>
          {workflow.code && (
            <p className="truncate font-mono text-xs text-muted-foreground">{workflow.code}</p>
          )}
        </div>

        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {workflow.description || "Chưa có mô tả."}
        </p>

        {appliedModuleName ? (
          <div className="flex w-fit max-w-full items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5 shrink-0" />
            <span className="truncate">Áp dụng: <strong>{appliedModuleName}</strong></span>
          </div>
        ) : (
          <div className="w-fit rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            Chưa phân bổ nghiệp vụ
          </div>
        )}
      </div>

      <footer className="pointer-events-none relative z-10 flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarClock className="size-3.5" />
          {formatWorkflowDate(workflow.updatedAt || workflow.createdAt)}
        </span>
        <span className="font-mono">v{workflow.version}</span>
      </footer>
    </article>
  );
}
