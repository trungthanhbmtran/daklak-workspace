import { UserClient } from "@/features/system-admin/users";

export const metadata = {
  title: "Quản lý người dùng | Quản trị Hệ thống",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Quản lý người dùng</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Xem danh sách và quản lý chi tiết người dùng
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <UserClient />
      </div>
    </div>
  );
}
