"use client";

import apiClient from "@/lib/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface IntegrationConfig {
  id: number;
  systemName: string;
  integrationCode: string;
  configData: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const integrationKeys = {
  all: ['integrations'] as const,
  lists: () => [...integrationKeys.all, 'list'] as const,
};

export const integrationApi = {
  getList: async (search?: string) => {
    const res = await apiClient.get('/admin/integrations', { params: { search } }) as any;
    if (res.status === 'success') return res.data as IntegrationConfig[];
    throw new Error(res.message);
  },
  create: async (data: any) => {
    const res = await apiClient.post('/admin/integrations', data) as any;
    if (res.status === 'success') return res.data;
    throw new Error(res.message);
  },
  update: async (data: any) => {
    const res = await apiClient.put(`/admin/integrations/${data.id}`, data) as any;
    if (res.status === 'success') return res.data;
    throw new Error(res.message);
  },
  delete: async (id: number) => {
    const res = await apiClient.delete(`/admin/integrations/${id}`) as any;
    if (res.status === 'success') return res.data;
    throw new Error(res.message);
  },
  toggleActive: async ({ id, isActive }: { id: number, isActive: boolean }) => {
    const res = await apiClient.put(`/admin/integrations/${id}/active`, { isActive }) as any;
    if (res.status === 'success') return res.data;
    throw new Error(res.message);
  }
};

export const useIntegrationList = (search?: string) => {
  return useQuery({
    queryKey: [...integrationKeys.lists(), search],
    queryFn: () => integrationApi.getList(search)
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useToggleActiveIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.toggleActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};
