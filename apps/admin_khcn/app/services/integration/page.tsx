import Link from "next/link";
import { Activity, ArrowRight, Layers, Network, Plug } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";

export const metadata = {
  title: "Trung tâm Tích hợp & Quy trình | Cổng Ứng dụng Nội bộ",
};

const MODULES = [
  {
    href: WORKFLOW_ROUTES.list,
    title: "Định nghĩa quy trình",
    description: "Thiết kế và số hóa luồng nghiệp vụ bằng sơ đồ BPMN 2.0 kéo thả.",
    icon: Layers,
  },
  {
    href: WORKFLOW_ROUTES.instances,
    title: "Quy trình đang chạy",
    description: "Giám sát các phiên thực thi quy trình trên toàn hệ thống.",
    icon: Activity,
  },
  {
    href: "/services/integration/gateway",
    title: "Cấu hình API Gateway",
    description: "Quản trị định tuyến, bảo mật và cấu hình cho các microservice.",
    icon: Network,
  },
  {
    href: "/services/integration/apis",
    title: "Kết nối API đầu vào",
    description: "Quản lý cấu hình, xác thực kết nối với hệ thống ngoài (LGSP, Webhook).",
    icon: Plug,
  },
] as const;

export default function IntegrationPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Trung tâm Tích hợp & Quy trình"
        description="Thiết kế luồng tự động hóa và quản trị giao tiếp dữ liệu giữa các phân hệ."
      />
      <nav aria-label="Phân hệ tích hợp" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <m.icon className="size-5" />
            </div>
            <h2 className="mb-1.5 text-base font-semibold group-hover:text-primary">{m.title}</h2>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary">
              Truy cập <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
