"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { TaskEvaluationApprovalSheet } from "@/features/hrm/components/tasks/TaskEvaluationApprovalSheet";

export function TaskEvaluateSheetClient({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isValid = Boolean(taskId && !Number.isNaN(taskId) && taskId > 0);

  return (
    <TaskEvaluationApprovalSheet
      taskId={isValid ? taskId : undefined}
      task={isValid ? ({ id: taskId } as any) : null}
      open={isValid}
      onOpenChange={(open) => {
        if (!open) {
          router.push("/services/hrm/work-plans/tasks", { scroll: false });
        }
      }}
    />
  );
}
