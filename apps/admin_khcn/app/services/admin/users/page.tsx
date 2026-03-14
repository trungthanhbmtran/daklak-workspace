import { UserClient } from "@/features/system-admin/users";

export const metadata = {
  title: "Quản lý người dùng | Quản trị Hệ thống",
};

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h2>
          <p className="text-muted-foreground">
            Xem danh sách, thêm tài khoản và xem chi tiết người dùng
          </p>
        </div>
      </div>

      <UserClient />
    </div>
  );
}
