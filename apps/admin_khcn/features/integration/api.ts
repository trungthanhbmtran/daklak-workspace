/* eslint-disable @typescript-eslint/no-explicit-any */
// rebuild: 2026-07-20
"use client";


import apiClient from "@/lib/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface LGSPConfigData {
  type: 'LGSP' | 'WEBHOOK' | 'SYSTEM' | 'POSTMAN';
  apiUrl?: string;
  apiToken?: string;
  authUrl?: string;
  keys?: {
    clientId: string;
    clientSecret: string;
    publicKey?: string;
    privateKey?: string;
  };
  endpoints?: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  permissions?: string[];
  [key: string]: any;
}

export interface PostmanHeader {
  key: string;
  value: string;
  type: string;
}

export interface PostmanRequest {
  auth?: { type: string };
  method: string;
  header: PostmanHeader[];
  url: {
    raw: string;
    protocol?: string;
    host?: string[];
    port?: string;
    path?: string[];
  };
}

export interface PostmanItem {
  name: string;
  request: PostmanRequest;
}

export interface PostmanConfigData extends LGSPConfigData {
  info: {
    name: string;
    _postman_id?: string;
    schema?: string;
    _exporter_id?: string;
  };
  item: PostmanItem[];
}

export interface IntegrationConfig {
  id: string; // Updated to string (uuid)
  name: string;
  code: string;
  description?: string;
  protocol: string;
  baseUrl: string;
  authType: string;
  authConfig?: any;
  headers?: any;
  endpoints?: any;
  metadata?: any;
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
    const res = await apiClient.get('/workflow/integrations', { params: { search } }) as any;
    if (res.success) return res.data as IntegrationConfig[];
    throw new Error(res.message || 'Lỗi lấy dữ liệu');
  },
  create: async (data: any) => {
    const res = await apiClient.post('/workflow/integrations', data) as any;
    if (res.success) return res.data;
    throw new Error(res.message || 'Lỗi khi tạo');
  },
  update: async (data: any) => {
    const res = await apiClient.put(`/workflow/integrations/${data.id}`, data) as any;
    if (res.success) return res.data;
    throw new Error(res.message || 'Lỗi khi cập nhật');
  },
  delete: async (id: string) => { // Updated to string
    const res = await apiClient.delete(`/workflow/integrations/${id}`) as any;
    if (res.success) return res.data;
    throw new Error(res.message || 'Lỗi khi xóa');
  },
  toggleActive: async ({ id, isActive }: { id: string, isActive: boolean }) => {
    const res = await apiClient.put(`/workflow/integrations/${id}`, { isActive }) as any;
    if (res.success) return res.data;
    throw new Error(res.message || 'Lỗi khi cập nhật trạng thái');
  },

  // Gateway APIs
  getGatewayEndpoints: async () => {
    const res = await apiClient.get('/integration/endpoints') as any;
    // For direct controller responses that might not have standard wrapper
    return res.data || res;
  },
  getNginxConfig: async () => {
    const res = await apiClient.get('/integration/nginx') as any;
    return res.data || res;
  },
  updateNginxConfig: async (content: string) => {
    const res = await apiClient.put('/integration/nginx', { content }) as any;
    return res.data || res;
  },
  getApiPermissions: async () => {
    const res = await apiClient.get('/integration/api-permissions') as any;
    return res.data?.rules || [];
  },
  updateApiPermissions: async (rules: any[]) => {
    const res = await apiClient.put('/integration/api-permissions', { rules }) as any;
    return res.data || res;
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

export const useGatewayEndpoints = () => {
  return useQuery({
    queryKey: ['integration', 'endpoints'],
    queryFn: integrationApi.getGatewayEndpoints
  });
};

export const useNginxConfig = () => {
  return useQuery({
    queryKey: ['integration', 'nginx'],
    queryFn: integrationApi.getNginxConfig
  });
};

export const useUpdateNginxConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.updateNginxConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integration', 'nginx'] })
  });
};

export const useApiPermissions = () => {
  return useQuery({
    queryKey: ['integration', 'api-permissions'],
    queryFn: integrationApi.getApiPermissions
  });
};

export const useUpdateApiPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: integrationApi.updateApiPermissions,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integration', 'api-permissions'] })
  });
};
