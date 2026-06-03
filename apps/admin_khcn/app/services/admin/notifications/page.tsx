import { NotificationConfigPanel } from "@/features/system-admin/notifications/components/NotificationConfigPanel";

export const metadata = {
  title: "Cấu hình Thông báo | Quản trị Hệ thống",
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cấu hình Thông báo</h2>
          <p className="text-muted-foreground">
            Quản lý các dịch vụ thông báo như Email, Telegram, Zalo
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <NotificationConfigPanel />
      </div>
    </div>
  );
}
