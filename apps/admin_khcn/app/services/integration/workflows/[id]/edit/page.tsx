import WorkflowEditorScreen from "@/components/workflow/WorkflowEditorScreen";

export const metadata = {
  title: "Chỉnh sửa quy trình | Cổng Ứng dụng Nội bộ",
};

export default async function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowEditorScreen id={decodeURIComponent(id)} />;
}
