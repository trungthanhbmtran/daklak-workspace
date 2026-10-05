import WorkflowEditorScreen from "@/components/workflow/WorkflowEditorScreen";

export const metadata = {
  title: "Chi tiết quy trình | Cổng Ứng dụng Nội bộ",
};

export default async function ViewWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowEditorScreen id={decodeURIComponent(id)} mode="view" />;
}
