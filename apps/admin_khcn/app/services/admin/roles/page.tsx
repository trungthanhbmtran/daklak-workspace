import { RoleClient } from "@/features/system-admin/roles";

export const metadata = { title: "Chính sách phân quyền (PBAC)" };

export default function RolesPage() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Vai trò & Chính sách (PBAC)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thiết lập vai trò và phân bổ quyền (policy) theo tài nguyên – Xem, Thêm, Sửa, Xóa cho từng module.
        </p>
      </div>
      <RoleClient />
    </div>
  );
}
