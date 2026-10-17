"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const TaskDetailDrawer = dynamic(
  () => import("@/features/hrm/components/tasks/task-detail-drawer").then((m) => m.TaskDetailDrawer),
  { ssr: false }
);

export function TaskDetailSheetClient({ taskId }: { taskId?: number }) {
  const router = useRouter();
  const isValid = Boolean(taskId && !Number.isNaN(taskId) && taskId > 0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [prevTaskId, setPrevTaskId] = useState(taskId);

  if (taskId !== prevTaskId) {
    setPrevTaskId(taskId);
    setIsDismissed(false);
  }

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen) {
      setIsDismissed(true);
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/services/hrm/work-plans/tasks", { scroll: false });
      }
    } else {
      setIsDismissed(false);
    }
  }, [router]);

  return (
    <TaskDetailDrawer
      taskId={isValid ? taskId : undefined}
      open={isValid && !isDismissed}
      onOpenChange={handleOpenChange}
    />
  );
}


