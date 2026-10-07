import WorkflowEditorScreen from "@/components/workflow/WorkflowEditorScreen";

export const metadata = {
  title: "Chỉnh sửa quy trình",
};

export default function EditWorkflowPage({ params }: { params: { id: string } }) {
  return <WorkflowEditorScreen id={params.id} mode="edit" />;
}
