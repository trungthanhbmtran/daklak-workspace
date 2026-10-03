import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Đường dẫn quay lại (route cha). Bỏ trống nếu là trang gốc của menu. */
  backHref?: string;
  backLabel?: string;
  /** Nội dung phụ hiển thị cạnh tiêu đề (badge trạng thái, phiên bản...). */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Tiêu đề trang gọn nằm BÊN TRONG vùng nội dung của ServiceLayout.
 * ServiceHeader đã hiển thị tên menu, nên PageHeader chỉ dùng cỡ chữ vừa (h1 text-xl)
 * để không tạo cảm giác "header chồng header".
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Quay lại",
  meta,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {backHref && (
          <Button asChild variant="outline" size="icon-sm" className="mt-0.5" aria-label={backLabel}>
            <Link href={backHref}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
        )}
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
            {meta}
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
