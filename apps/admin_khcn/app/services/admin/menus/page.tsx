import { MenuClient } from "@/features/system-admin/menus";

export const metadata = {
  title: "Quản lý Menu | Quản trị Hệ thống",
};

export default function MenusPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Điều hướng hệ thống (Menu)</h2>
          <p className="text-muted-foreground">
            Quản lý danh sách các menu hiển thị trên thanh Sidebar và Portal.
          </p>
        </div>
      </div>
      
      <MenuClient />
    </div>
  );
}
