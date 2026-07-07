import { MenuClient } from "@/features/system-admin/menus";

export const metadata = {
  title: "Quản lý Menu | Quản trị Hệ thống",
};

export default function MenusPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Điều hướng hệ thống (Menu)</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Quản lý danh sách các menu hiển thị trên thanh Sidebar và Portal.
          </p>
        </div>
      </div>
      
      <MenuClient />
    </div>
  );
}
