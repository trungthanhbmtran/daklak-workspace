import apiClient from "@/lib/axiosInstance";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type?: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const res: any = await apiClient.get("/notifications");
  const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  return (data as NotificationItem[]).map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title ?? "",
    body: n.body ?? "",
    createdAt: n.createdAt ?? "",
    read: Boolean(n.read),
    type: n.type,
  }));
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const res = await apiClient.patch<{ success?: boolean }>("/notifications/$id/read");
  return { success: (res as { success?: boolean })?.success ?? false };
}

export const notificationConfigApi = {
  list: async () => {
    const res = await apiClient.get("/integrations");
    return (res as any)?.data ?? res;
  },
  create: async (body: any) => {
    const res = await apiClient.post("/integrations", body);
    return (res as any)?.data ?? res;
  },
  update: async (id: number, body: any) => {
    const res = await apiClient.put(`/integrations/${id}`, body);
    return (res as any)?.data ?? res;
  },
};
