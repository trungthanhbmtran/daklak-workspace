"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const CreateTaskDialog = dynamic(
  () => import("@/features/hrm/components/tasks/create-task-dialog").then((m) => m.CreateTaskDialog),
  { ssr: false }
);

export function CreateTaskSheetClient() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
      } else {
        router.push("/services/hrm/work-plans/tasks", { scroll: false });
      }
    }
  }, [router]);

  return (
    <CreateTaskDialog
      open={open}
      onOpenChange={handleOpenChange}
    />
  );
}

