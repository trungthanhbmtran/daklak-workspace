import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Quản lý Menu | Quản trị Hệ thống",
};

export default function MenusPage() {
  return (
    <Card className="flex-1 w-full h-full min-h-0 shadow-none border-border flex items-center justify-center bg-muted/5 border-dashed rounded-xl transition-all p-0 gap-0">
      <div className="flex flex-col items-center">
        <div className="p-4 bg-background rounded-full shadow-sm mb-4">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Chọn menu từ danh sách để thiết lập cấu hình</p>
      </div>
    </Card>
  );
}
