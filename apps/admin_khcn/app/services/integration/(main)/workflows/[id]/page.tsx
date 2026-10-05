import WorkflowDetailView from "@/components/workflow/WorkflowDetailView";

export const metadata = {
  title: "Chi tiết quy trình | Cổng Ứng dụng Nội bộ",
};

export default async function WorkflowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkflowDetailView id={decodeURIComponent(id)} />;
}
