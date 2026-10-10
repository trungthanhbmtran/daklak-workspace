import Link from "next/link";
import { ArrowRight, Network, Plug } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import { GATEWAY_ROUTES } from "@/features/gateway/routes";

export const metadata = {
  title: "Quản lý Gateway & Kết nối | Cổng Ứng dụng Nội bộ",
};

const MODULES = [
  {
    href: GATEWAY_ROUTES.gateway,
    title: "Cấu hình API Gateway (Inbound)",
    description: "Quản trị định tuyến (Routes), microservices nội bộ (Upstreams) và cấp phát khóa bảo mật (API Keys) cho các luồng Inbound.",
    icon: Network,
  },
  {
    href: GATEWAY_ROUTES.apis,
    title: "Kết nối API Outbound",
    description: "Khai báo cấu hình và xác thực để gọi ra các hệ thống bên ngoài (LGSP, webhook, thanh toán).",
    icon: Plug,
  },
] as const;

export default function ApiManagerPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quản lý Gateway & API"
        description="Trung tâm điều khiển luồng dữ liệu vào (Inbound) và các kết nối hướng ra (Outbound)."
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
