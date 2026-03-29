import WorkflowEditor from "@/components/workflow/WorkflowEditor";

export const metadata = {
  title: "Workflow Builder | Nội bộ",
  description: "Xây dựng và quản lý quy trình nghiệp vụ tự động.",
};

export default function WorkflowPage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <WorkflowEditor />
    </main>
  );
}
