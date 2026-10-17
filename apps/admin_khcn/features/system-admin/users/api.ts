/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import type { UserItem, UserDetail, UserCreatePayload, UserPolicyItem } from "./types";

export const userApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: UserItem[], meta: { total: number } }> => {
    try {
      const res: any = await apiClient.get("/users", { params });
      return {
        data: unwrapData<UserItem[]>(res, []),
        meta: { total: res?.meta?.pagination?.total ?? res?.meta?.total ?? 0 }
      };
    } catch (err: any) {
      if (err.response?.status === 406) return { data: [], meta: { total: 0 } };
      throw err;
    }
  },

  getOne: async (id: number): Promise<UserDetail> => {
    const res: any = await apiClient.get(`/users/${id}`);
    return unwrapData<UserDetail>(res, res);
  },

  getPolicies: async (id: number): Promise<UserPolicyItem[]> => {
    const res: any = await apiClient.get(`/users/${id}/policies`);
    return unwrapData<UserPolicyItem[]>(res, []);
  },

  create: async (payload: UserCreatePayload): Promise<UserItem> => {
    const res: any = await apiClient.post("/users", payload);
    return unwrapData<UserItem>(res, res);
  },

  setActive: async (id: number, isActive: boolean): Promise<{ success: boolean; message?: string }> => {
    const res: any = await apiClient.patch(`/users/${id}/active`, { isActive });
    return { success: res?.success ?? true, message: res?.message };
  },

  update: async (id: number, payload: Partial<UserCreatePayload>): Promise<UserItem> => {
    const res: any = await apiClient.put(`/users/${id}`, payload);
    return unwrapData<UserItem>(res, res);
  },

  remove: async (id: number): Promise<{ success: boolean }> => {
    const res: any = await apiClient.delete(`/users/${id}`);
    return { success: res?.success ?? true };
  },

  assignUserGroups: async (id: number, userGroupIds: number[]): Promise<{ success: boolean }> => {
    const res: any = await apiClient.post(`/users/${id}/assign-user-groups`, { userGroupIds });
    return { success: res?.success ?? true };
  },

  updateNotificationPrefs: async (id: number, prefs: Record<string, boolean>) => {
    const res: any = await apiClient.put(`/users/${id}/notification-prefs`, {
      notificationPrefs: prefs,
    });
    return unwrapData(res);
  },
};

export const notificationApi = {
  getEvents: async (): Promise<any[]> => {
    const res: any = await apiClient.get("/notifications/events");
    return unwrapData<any[]>(res, []);
  },
};
