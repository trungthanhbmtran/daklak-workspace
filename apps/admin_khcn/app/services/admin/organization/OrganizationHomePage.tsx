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
              <Plus className="h-4 w-4 mr-2" />
              Tạo đơn vị đầu tiên
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Chọn một đơn vị từ cây tổ chức bên trái để xem và chỉnh sửa thông tin.
          </p>
        )}
      </div>
    </div>
  );
}
