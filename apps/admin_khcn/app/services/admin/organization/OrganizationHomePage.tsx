"use client";

import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useOrganizationContext } from "@/features/system-admin/organization/context/OrganizationContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationHomePage() {
  const router = useRouter();
  const { state } = useOrganizationContext();
  const { flatUnits, isLoadingTree } = state;

  if (isLoadingTree) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl border border-dashed bg-muted/20">
        <div className="flex flex-col items-center gap-4 px-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    );
  }

  const isEmpty = flatUnits.length === 0;

  return (
    <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl border border-dashed bg-muted/20">
      <div className="flex flex-col items-center gap-5 px-6 text-center">
        <div className="rounded-full bg-muted/50 p-5">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
        </div>
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-lg font-semibold">Chưa có cơ cấu tổ chức</h3>
            <p className="text-sm text-muted-foreground max-w-[350px]">
              Hệ thống chưa có đơn vị nào. Bạn đang có quyền quản trị, vui lòng khởi tạo cơ cấu tổ chức đầu tiên.
            </p>
            <Button onClick={() => router.push("/services/admin/organization/create")} className="mt-2">
              <Plus className="h-4 w-4" />
              Tạo đơn vị đầu tiên
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <p className="text-sm text-muted-foreground max-w-[280px]">
              Chọn một đơn vị từ cây tổ chức bên trái để xem và chỉnh sửa thông tin.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-[360px]">
              <Button 
                variant="outline" 
                className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                onClick={() => router.push("/services/admin/unit-job-templates")}
              >
                <div className="p-2 rounded-full bg-muted/50 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase-business"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a18.15 18.15 0 0 1-20 0"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                </div>
                <span className="text-sm font-medium">Phân loại chức danh</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                onClick={() => router.push("/services/admin/categories")}
              >
                <div className="p-2 rounded-full bg-muted/50 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings-2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>
                </div>
                <span className="text-sm font-medium">Danh mục hệ thống</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
