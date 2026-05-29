import { IntegrationClient } from "@/features/system-admin/integration";

export const metadata = {
  title: "Trung tâm liên thông | Quản trị Hệ thống",
};

export default function IntegrationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trung tâm Liên thông</h2>
          <p className="text-muted-foreground">
            Quản lý mã liên thông (API Key) và cấu hình System-to-System
          </p>
        </div>
      </div>

      <IntegrationClient />
    </div>
  );
}
