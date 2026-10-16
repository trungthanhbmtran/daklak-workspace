"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CreateTaskDialog } from "@/features/hrm/components/tasks/create-task-dialog";

export function CreateTaskSheetClient() {
  const router = useRouter();

  return (
    <CreateTaskDialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          router.push("/services/hrm/work-plans/tasks", { scroll: false });
        }
      }}
    />
  );
}
