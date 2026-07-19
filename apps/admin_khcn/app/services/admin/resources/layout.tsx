import { ResourceSidebar } from "@/features/system-admin/resources";

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="mb-4 shrink-0 px-2">
        <h1 className="text-2xl font-bold tracking-tight">Tài nguyên & Quyền (Resources & Permissions)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Định nghĩa các Module (Tài nguyên) trong hệ thống và các Hành động (Quyền) tương ứng.
          Lưu ý: Chỉ thay đổi khi có sự cập nhật API từ Backend.
        </p>
      </div>

      {/* 2-column layout: Sidebar + Detail */}
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Sidebar — cố định, KHÔNG re-render khi navigate [id] */}
        <div className="w-full lg:w-[420px] shrink-0 h-full flex flex-col min-h-0">
          <ResourceSidebar />
        </div>

        {/* Detail panel — chỉ phần này re-render */}
        <div className="flex-1 h-full min-w-0 hidden lg:block overflow-hidden p-1">
          {children}
        </div>
      </div>
    </div>
  );
}
