/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { pickData, pickOne, pickMeta, type ApiResponse } from "@/lib/api.types";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type?: string;
  category?: 'REMINDER' | 'TODAY' | 'EARLIER';
  metadata?: Record<string, any>;
}

export async function getNotifications({ pageParam = 1 }: { pageParam?: number } = {}): Promise<{ data: NotificationItem[], nextCursor: number | undefined }> {
  const limit = 10;
  const res = await apiClient.get<any, ApiResponse<NotificationItem[]>>(`/notifications?page=${pageParam}&limit=${limit}`);
  const data = pickData(res);
  const meta = pickMeta(res) as any;
  const items = data.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title ?? "",
    body: n.body ?? "",
    createdAt: n.createdAt ?? "",
    read: Boolean(n.read),
    type: n.type,
    category: n.category,
    metadata: n.metadata,
  }));

  let nextCursor: number | undefined = undefined;
  if (meta && meta.page && meta.totalPages && meta.page < meta.totalPages) {
    nextCursor = Number(meta.page) + 1;
  } else if (items.length === limit) {
    nextCursor = pageParam + 1;
  }

  return { data: items, nextCursor };
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
