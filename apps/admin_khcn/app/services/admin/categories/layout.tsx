import { CategorySidebar } from "@/features/system-admin/categories";

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between shrink-0 mb-4 px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Danh mục hệ thống</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Quản lý các danh mục dùng chung (Phòng ban, Chức vụ, Loại văn bản...)
          </p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 min-w-0">
        <CategorySidebar />
        {children}
      </div>
    </div>
  );
}
