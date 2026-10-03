/* eslint-disable @typescript-eslint/no-explicit-any */
// rebuild: 2026-07-20
"use client";


import apiClient from "@/lib/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse } from "@/lib/api.types";

export const useCategories = (groupCode: string) => {
  return useQuery({
    queryKey: ['integration-categories', groupCode],
    queryFn: async (): Promise<any[]> => {
      const res = await apiClient.get(`/categories`, { params: { group: groupCode } }) as any as ApiResponse<any[]>;
      return res.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

const mapAuthKind = (authType?: string) => {
  if (!authType) return 'none';
  const type = authType.toUpperCase();
  if (type === 'OAUTH2') return 'oauth2_client_credentials';
  if (type === 'API_KEY') return 'apiKey';
  if (type === 'BEARER') return 'bearer';
  if (type === 'BASIC') return 'basic';
  if (type === 'MTLS') return 'mtls';
  return 'none';
};

export interface IntegrationConfig {
  id: string; // Updated to string (uuid)
  name: string;
  code: string;
  version?: string;
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

const mapAuthType = (kind?: string) => {
  if (!kind) return 'NONE';
  if (kind === 'oauth2_client_credentials') return 'OAUTH2';
  if (kind === 'apiKey') return 'API_KEY';
  if (kind === 'bearer') return 'BEARER';
  if (kind === 'basic') return 'BASIC';
  if (kind === 'mtls') return 'MTLS';
  return 'NONE';
};

export const integrationApi = {
  getList: async (search?: string): Promise<IntegrationConfig[]> => {
    const res = await apiClient.get('/integration-upstreams', { params: { search } }) as any;
    const entries = Array.isArray(res) ? res : res.data;
    if (Array.isArray(entries)) {
      return entries.map(item => {
        // Map backend IntegrationUpstream -> frontend IntegrationConfig
        const authObj = item.auth ? (typeof item.auth === 'string' ? JSON.parse(item.auth) : item.auth) : null;
        const metaObj = item.metadata ? (typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata) : {};
        return {
          ...item,
          metadata: metaObj,
          code: metaObj._uiConfig?.code || item.code || (item.id ? item.id.toUpperCase().replace(/-/g, '_') : 'UNKNOWN'),
          version: metaObj._uiConfig?.version || (item.version ? String(item.version) : ""),
          protocol: item.protocol || item.type || "REST",
          authType: item.authType || mapAuthType(authObj?.kind),
          authConfig: item.authConfig || (authObj ? authObj.config : undefined),
          isActive: item.isActive ?? item.enabled ?? true,
        };
      });
    }
    throw new Error(res.message || 'Lỗi lấy dữ liệu');
  },
  create: async (data: any) => {
    const payload = {
      ...data,
      type: data.protocol || data.type,
      enabled: data.isActive !== undefined ? data.isActive : data.enabled,
      allowedPaths: data.endpoints?.map((e: any) => e.path) || [],
      allowedMethods: data.endpoints?.map((e: any) => e.method) || [],
      timeoutMs: data.timeoutMs ?? 30000,
      cacheTtlSec: data.cacheTtlSec ?? 0,
      retry: data.retry ? (typeof data.retry === 'string' ? data.retry : JSON.stringify(data.retry)) : '{}',
      rateLimit: data.rateLimit ? (typeof data.rateLimit === 'string' ? data.rateLimit : JSON.stringify(data.rateLimit)) : '{}',
      roles: data.roles ? (typeof data.roles === 'string' ? data.roles.split(',').map((s: string) => s.trim()).filter(Boolean) : data.roles) : [],
      scopes: data.scopes ? (typeof data.scopes === 'string' ? data.scopes.split(',').map((s: string) => s.trim()).filter(Boolean) : data.scopes) : [],
      auth: data.auth || {
        kind: mapAuthKind(data.authType),
        config: data.authConfig
      },
      metadata: {
        ...(data.metadata || {}),
        _uiConfig: {
          code: data.code,
          version: data.version
        }
      }
    };
    const res = await apiClient.post('/integration-upstreams', payload) as any;
    if (res.success || res.id) return res.data || res;
    throw new Error(res.message || 'Lỗi khi tạo');
  },
  update: async (data: any) => {
    const payload = {
      ...data,
      type: data.protocol || data.type,
      enabled: data.isActive !== undefined ? data.isActive : data.enabled,
      allowedPaths: data.endpoints?.map((e: any) => e.path) || [],
      allowedMethods: data.endpoints?.map((e: any) => e.method) || [],
      timeoutMs: data.timeoutMs ?? 30000,
      cacheTtlSec: data.cacheTtlSec ?? 0,
      retry: data.retry ? (typeof data.retry === 'string' ? data.retry : JSON.stringify(data.retry)) : '{}',
      rateLimit: data.rateLimit ? (typeof data.rateLimit === 'string' ? data.rateLimit : JSON.stringify(data.rateLimit)) : '{}',
      roles: data.roles ? (typeof data.roles === 'string' ? data.roles.split(',').map((s: string) => s.trim()).filter(Boolean) : data.roles) : [],
      scopes: data.scopes ? (typeof data.scopes === 'string' ? data.scopes.split(',').map((s: string) => s.trim()).filter(Boolean) : data.scopes) : [],
      auth: data.auth || {
        kind: mapAuthKind(data.authType),
        config: data.authConfig
      },
      metadata: {
        ...(data.metadata || {}),
        _uiConfig: {
          code: data.code,
          version: data.version
        }
      }
    };
    const res = await apiClient.put(`/integration-upstreams/${data.id}`, payload) as any;
    if (res.success || res.id) return res.data || res;
    throw new Error(res.message || 'Lỗi khi cập nhật');
  },
  delete: async (id: string) => { // Updated to string
    const res = await apiClient.delete(`/integration-upstreams/${id}`) as any;
    if (res.success || res) return res.data || res;
    throw new Error(res.message || 'Lỗi khi xóa');
  },
  toggleActive: async ({ id, isActive }: { id: string, isActive: boolean }) => {
    // Note: Depends on whether /integration-upstreams supports patch/toggle directly. If not, use update.
    const res = await apiClient.put(`/integration-upstreams/${id}`, { enabled: isActive }) as any;
    if (res.success || res) return res.data || res;
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
  execute: async (upstreamName: string, payload: any) => {
    // Trực tiếp gọi vào Gateway Data Plane thay vì nhờ Workflow gọi hộ!
    const cleanPath = payload.endpointPath.startsWith('/') ? payload.endpointPath : `/${payload.endpointPath}`;
    const url = `/gw/${upstreamName}${cleanPath}`;
    
    // apiClient sẽ lo việc gắn base url (vd: /api/v1)
    const res = await apiClient.request({
      method: payload.method,
      url,
      headers: payload.headers,
      params: payload.params,
      data: payload.body,
    });
    
    return {
      success: true,
      status: res.status,
      data: res.data,
    };
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
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: integrationApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: integrationApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: integrationApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: integrationKeys.lists() })
  });
};

export const useToggleActiveIntegration = () => {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
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
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: integrationApi.updateNginxConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['integration', 'nginx'] })
  });
};
