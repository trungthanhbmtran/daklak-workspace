import WorkflowList from "@/components/workflow/WorkflowList";

export const metadata = {
  title: "Quản lý quy trình",
};

export default function WorkflowsPage() {
  return (
    <div className="p-6 h-full flex-1">
      <WorkflowList />
    </div>
  );
}
