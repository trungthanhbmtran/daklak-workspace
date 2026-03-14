import apiClient from "@/lib/axiosInstance";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get<unknown>("/notifications");
  const data = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data ?? [];
  return (data as NotificationItem[]).map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title ?? "",
    body: n.body ?? "",
    createdAt: n.createdAt ?? "",
    read: Boolean(n.read),
  }));
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const res = await apiClient.patch<{ success?: boolean }>(`/notifications/${id}/read`);
  return { success: (res as { success?: boolean })?.success ?? false };
}
