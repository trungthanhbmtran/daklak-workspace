import WorkflowBindingList from "@/components/workflow/WorkflowBindingList";

export const metadata = {
  title: "Cấu hình tự động (Auto-Binding)",
};

export default function WorkflowBindingsPage() {
  return (
    <div className="p-6 h-full flex-1">
      <WorkflowBindingList />
    </div>
  );
}
