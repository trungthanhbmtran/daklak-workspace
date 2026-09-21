"use client";


import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { FileText, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useOrganizationDetailQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { useOrganizationContext } from "@/features/system-admin/organization/context/OrganizationContext";

export default function OrganizationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams<{ code: string }>();
  
  // Lấy param đồng bộ từ useParams để tránh suspend (Suspense fallback) khi chuyển đổi giữa các tab
  const rawCode = params?.code;
  const code = rawCode ? decodeURIComponent(rawCode) : "";

  // Guard: nếu code chưa có (hydration chưa xong), hiển thị skeleton thay vì render tabs với href sai
  const encodedCode = code ? encodeURIComponent(code) : "";

  const { data: unitData, isPending, isFetching, isError } = useOrganizationDetailQuery(code);
  const unit = unitData?.data;

  // TanStack Query v5: khi query disabled (code = ""), isLoading = false, isPending = true.
  // Do đó phải dùng (isPending || isFetching) để hiển thị Skeleton.
  const isQueryLoading = isPending || isFetching;

  const { state } = useOrganizationContext();
  const { flatUnits } = state;
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  if (isError || (!isQueryLoading && !unit && code)) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl border bg-card text-card-foreground shadow-sm h-full">
        <div className="flex flex-col items-center gap-2">
          <p className="text-muted-foreground">Không tìm thấy đơn vị hoặc mã đơn vị không hợp lệ (Mã: {code}).</p>
          <Link href="/services/admin/organization">
            <Badge variant="outline" className="cursor-pointer hover:bg-muted">
              Quay lại danh sách
            </Badge>
          </Link>
        </div>
      </div>
    );
  }

  // Tabs chỉ được tạo khi đã có encodedCode — tránh href sai khi code chưa hydrate
  const tabs = encodedCode
    ? [
        {
          id: "info",
          label: "Thông tin",
          icon: FileText,
          href: `/services/admin/organization/${encodedCode}/info`,
        },
        {
          id: "scope",
          label: "Phạm vi phụ trách",
          icon: MapPin,
          href: `/services/admin/organization/${encodedCode}/scope`,
        },
        {
          id: "staffing",
          label: "Định biên & Chức danh",
          icon: Users,
          href: `/services/admin/organization/${encodedCode}/staffing`,
        },
      ]
    : [];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm h-full">
      
      {/* Header */}
      <div className="pb-4 shrink-0 bg-muted/10 border-b p-4">
        {isQueryLoading && !unit ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-1/3" />
          </div>
        ) : unit ? (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {parentUnit ? `${parentUnit.name} /` : "Cơ cấu tổ chức /"} {unit.name}
              </p>
              <h2 className="text-base font-semibold leading-none tracking-tight">
                {unit.name}
              </h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0 bg-background">{unit.code}</Badge>
          </div>
        ) : null}
      </div>

      {/* Tab bar equivalent using links */}
      <div className="shrink-0 border-b bg-muted/30 px-4 pt-3 pb-2">
        {!encodedCode ? (
          // Skeleton tab bar khi code chưa hydrate — tránh render <Link> với href sai
          <div className="flex h-9 w-full sm:w-auto bg-muted/60 p-0.5 rounded-lg space-x-1">
            <Skeleton className="flex-1 h-full rounded-md" />
            <Skeleton className="flex-1 h-full rounded-md" />
            <Skeleton className="flex-1 h-full rounded-md" />
          </div>
        ) : (
          <nav className="flex h-9 w-full sm:w-auto bg-muted/60 p-0.5 rounded-lg space-x-1" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col focus-visible:outline-none h-full">
        {children}
      </div>
    </div>
  );
}
