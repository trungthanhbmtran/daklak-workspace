import { Component } from "lucide-react";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Quản trị Tài nguyên & Quyền hệ thống" };

export default function ResourcesPage() {
  return (
    <Card className="w-full h-full shadow-sm border-border flex items-center justify-center bg-muted/10 border-dashed rounded-xl">
      <div className="flex flex-col items-center max-w-sm text-center">
        <div className="h-16 w-16 bg-background border rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <Component className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Chưa chọn Tài nguyên</h3>
        <p className="text-sm text-muted-foreground">
          Vui lòng chọn một Module ở danh sách bên trái để xem và chỉnh sửa thông tin.
        </p>
      </div>
    </Card>
  );
}
