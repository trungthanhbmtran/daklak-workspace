import WorkflowInstanceList from "@/components/workflow/WorkflowInstanceList";

export const metadata = {
  title: "Lịch sử thực thi quy trình",
};

export default function WorkflowInstancesPage() {
  return (
    <div className="p-6 h-full flex-1">
      <WorkflowInstanceList />
    </div>
  );
}
