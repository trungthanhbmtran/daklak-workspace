import apiClient from "@/lib/axiosInstance";
import { pickData, pickOne, type ApiResponse } from "@/lib/api.types";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type?: string;
  metadata?: Record<string, any>;
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const res = await apiClient.get<any, ApiResponse<NotificationItem[]>>("/notifications");
  const data = pickData(res);
  return data.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title ?? "",
    body: n.body ?? "",
    createdAt: n.createdAt ?? "",
    read: Boolean(n.read),
    type: n.type,
    metadata: n.metadata,
  }));
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  const res = await apiClient.patch<any, ApiResponse<{ success?: boolean }>>(`/notifications/${id}/read`);
  return { success: res.success ?? false };
}

export const notificationConfigApi = {
  list: async () => {
    const res = await apiClient.get<any, ApiResponse<any[]>>("/integrations");
    return pickData(res);
  },
  create: async (body: any) => {
    const res = await apiClient.post<any, ApiResponse<any>>("/integrations", body);
    return pickOne(res);
  },
  update: async (id: number, body: any) => {
    const res = await apiClient.put<any, ApiResponse<any>>(`/integrations/${id}`, body);
    return pickOne(res);
  },
};
