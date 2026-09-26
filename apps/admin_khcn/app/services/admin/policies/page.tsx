import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Quản lý Vai trò | Quản trị Hệ thống",
};

export default function RolesPage() {
  return (
    <Card className="flex-1 w-full h-full min-h-0 shadow-none border-border border-dashed bg-muted/10 flex flex-col items-center justify-center p-12 text-center rounded-xl">
      <div className="p-4 bg-background rounded-full shadow-sm mb-4">
        <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="font-bold text-foreground">Chưa chọn Vai trò</h3>
      <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
        Vui lòng chọn vai trò bên trái để bắt đầu thiết lập quyền truy cập tài nguyên.
      </p>
    </Card>
  );
}
