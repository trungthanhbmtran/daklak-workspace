import WorkflowInstanceList from "@/components/workflow/WorkflowInstanceList";
import { PageHeader } from "@/components/layouts/page-header";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";

export const metadata = {
  title: "Quy trình đang chạy | Cổng Ứng dụng Nội bộ",
};

export default function WorkflowInstancesPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quy trình đang chạy"
        description="Giám sát trạng thái các phiên thực thi quy trình trong hệ thống."
        backHref={WORKFLOW_ROUTES.hub}
        backLabel="Về Trung tâm tích hợp"
      />
      <div className="rounded-xl border bg-card p-4">
        <WorkflowInstanceList />
      </div>
    </div>
  );
}
