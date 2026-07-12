import { MenuSidebar } from "@/features/system-admin/menus";

export default function MenusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 shrink-0 px-2">
        <h1 className="text-2xl font-bold tracking-tight">Cấu trúc Menu Hệ thống</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý cây danh mục điều hướng (Sidebar) và liên kết quyền truy cập PBAC cho từng menu.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 min-w-0 overflow-hidden font-sans antialiased">
        <MenuSidebar />
        <div className="flex-1 h-full min-w-0 hidden lg:block overflow-y-auto p-1">
          {children}
        </div>
      </div>
    </div>
  );
}
