import WorkflowBindingList from "@/components/workflow/WorkflowBindingList";

export const metadata = {
  title: "Cấu hình tự động | Quản lý Quy trình",
};

export default function WorkflowsBindingPage() {
  return (
    <div className="container mx-auto py-6">
      <WorkflowBindingList />
    </div>
  );
}
