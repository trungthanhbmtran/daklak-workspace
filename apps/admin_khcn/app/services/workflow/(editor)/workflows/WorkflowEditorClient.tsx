"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const DynamicWorkflowEditor = dynamic(
  () => import("@/features/workflow/screens/WorkflowEditorScreen").then((m) => m.WorkflowEditorScreen),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p>Đang khởi tạo trình thiết kế quy trình...</p>
      </div>
    ),
  }
);
