import { RoleSidebar } from "@/features/system-admin/roles";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 shrink-0 px-2">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Vai trò (Roles)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thiết lập các vai trò và gán quyền hạn truy cập (PBAC) cho từng vai trò trên hệ thống.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 min-w-0 overflow-hidden">
        <RoleSidebar />
        <div className="flex-1 h-full min-w-0 hidden lg:block overflow-y-auto p-1">
          {children}
        </div>
      </div>
    </div>
  );
}
