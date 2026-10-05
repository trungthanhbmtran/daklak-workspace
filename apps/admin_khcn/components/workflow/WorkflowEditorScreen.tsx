"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";

// React Flow chỉ chạy phía trình duyệt — tải động, không SSR.
const WorkflowEditor = dynamic(() => import("./WorkflowEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary/50" />
    </div>
  ),
});

/**
 * Màn hình thiết kế toàn khung cho route /workflows/new và /workflows/[id]/edit.
 * Chiếm trọn vùng nội dung của ServiceLayout (h-full) để canvas không bị cắt hay đẩy dưới header.
 */
export default function WorkflowEditorScreen({ id }: { id?: string }) {
  const router = useRouter();
  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden bg-background">
      <WorkflowEditor
        id={id}
        onBack={() => router.push(WORKFLOW_ROUTES.list)}
      />
    </div>
  );
}
