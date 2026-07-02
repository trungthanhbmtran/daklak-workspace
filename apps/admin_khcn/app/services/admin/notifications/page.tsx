import { NotificationConfigPanel } from "@/features/system-admin/notifications/components/NotificationConfigPanel";

export const metadata = {
  title: "Cấu hình Thông báo | Quản trị Hệ thống",
};

export default function NotificationsPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <NotificationConfigPanel />
    </div>
  );
}
