import { CategoryClient } from "@/features/system-admin/categories";

export const metadata = {
  title: "Quản lý Danh mục | Quản trị Hệ thống",
};

export default function CategoriesPage() {
  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Danh mục hệ thống</h2>
          <p className="text-muted-foreground">
            Quản lý các danh mục dùng chung (Phòng ban, Chức vụ, Loại văn bản...)
          </p>
        </div>
      </div>

      {/* Gọi Client Component để xử lý logic bảng và Popup */}
      <CategoryClient />
    </div>
  );
}
