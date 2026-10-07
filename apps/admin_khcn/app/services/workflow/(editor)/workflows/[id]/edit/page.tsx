import { WorkflowEditorScreen } from "@/features/workflow/screens/WorkflowEditorScreen";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <WorkflowEditorScreen id={id} />; }
