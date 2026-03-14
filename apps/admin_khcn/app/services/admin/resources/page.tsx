import { ResourceClient } from "@/features/system-admin/resources";

export const metadata = { title: "Quản trị Tài nguyên & Quyền hệ thống" };

export default function ResourcesPage() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tài nguyên & Quyền (Resources & Permissions)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Định nghĩa các Module (Tài nguyên) trong hệ thống và các Hành động (Quyền) tương ứng. 
          Lưu ý: Chỉ thay đổi khi có sự cập nhật API từ Backend.
        </p>
      </div>
      <ResourceClient />
    </div>
  );
}
