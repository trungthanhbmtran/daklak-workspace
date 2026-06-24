import { UserClient } from "@/features/system-admin/users";

export const metadata = {
  title: "Quản lý người dùng | Quản trị Hệ thống",
};

export default function UsersPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">
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
