import Link from "next/link";
import { Activity, GitBranch, Layers3 } from "lucide-react";
import { ServiceLayout } from "@/components/layouts/service-layout";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";

const sections = [
  { href: WORKFLOW_ROUTES.list, label: "Quy trình", description: "Thiết kế và phát hành luồng nghiệp vụ", icon: GitBranch },
  { href: WORKFLOW_ROUTES.bindings, label: "Gắn nghiệp vụ", description: "Chọn quy trình theo loại hồ sơ và sự kiện", icon: Layers3 },
  { href: WORKFLOW_ROUTES.instances, label: "Phiên đang chạy", description: "Theo dõi trạng thái xử lý từ workflow service", icon: Activity },
];

export default function WorkflowMainLayout({ children }: { children: React.ReactNode }) {
  return <ServiceLayout><div className="flex min-h-full flex-col gap-5">
    <nav aria-label="Điều hướng Workflow" className="flex flex-wrap gap-2 border-b pb-3">
      {sections.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Icon className="size-4" />{label}</Link>)}
    </nav>
    {children}
  </div></ServiceLayout>;
}
