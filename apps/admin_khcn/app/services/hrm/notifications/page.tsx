import { NotificationListClient } from "@/features/notifications/NotificationListClient";

export const metadata = {
  title: "Thông báo - HRM",
};

export default function NotificationsPage() {
  return (
    <div className="flex-1 w-full p-4 md:p-8">
      <NotificationListClient />
    </div>
  );
}
