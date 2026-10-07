import WorkflowEditorScreen from "@/components/workflow/WorkflowEditorScreen";

export const metadata = {
  title: "Chi tiết quy trình",
};

export default function ViewWorkflowPage({ params }: { params: { id: string } }) {
  return <WorkflowEditorScreen id={params.id} mode="view" />;
}
