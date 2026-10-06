import Link from "next/link";
import { ArrowRight, Network, Plug } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import { GATEWAY_ROUTES } from "@/features/gateway/routes";

export const metadata = {
  title: "Quản lý API Gateway | Cổng Ứng dụng Nội bộ",
};

const MODULES = [
  {
    href: GATEWAY_ROUTES.gateway,
    title: "Cấu hình API Gateway",
    description: "Quản trị định tuyến, bảo mật và cấu hình cho các microservice.",
    icon: Network,
  },
  {
    href: GATEWAY_ROUTES.apis,
    title: "Kết nối API đầu vào",
    description: "Quản lý cấu hình, xác thực kết nối với hệ thống ngoài (LGSP, Webhook).",
    icon: Plug,
  },
] as const;

export default function ApiManagerPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quản lý API Gateway"
        description="Quản trị giao tiếp dữ liệu giữa các phân hệ và hệ thống bên ngoài."
      />
      <nav aria-label="Phân hệ API Gateway" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
