import { Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Cơ cấu tổ chức | Quản trị Hệ thống",
};

export default function OrganizationPage() {
  return (
    <div className="flex-1 min-h-0 flex items-center justify-center rounded-xl border border-dashed bg-muted/20">
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="rounded-full bg-muted/50 p-5">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          Chọn một đơn vị từ cây tổ chức bên trái để xem và chỉnh sửa thông tin.
        </p>
      </div>
    </div>
  );
}
