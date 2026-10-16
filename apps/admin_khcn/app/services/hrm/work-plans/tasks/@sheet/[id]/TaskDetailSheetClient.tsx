"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TaskDetailDrawer } from "@/features/hrm/components/tasks/task-detail-drawer";

export function TaskDetailSheetClient({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isValid = Boolean(taskId && !Number.isNaN(taskId) && taskId > 0);

  return (
    <TaskDetailDrawer
      taskId={isValid ? taskId : undefined}
      open={isValid}
      onOpenChange={(open) => {
        if (!open) {
          router.push("/services/hrm/work-plans/tasks", { scroll: false });
        }
      }}
    />
  );
}
