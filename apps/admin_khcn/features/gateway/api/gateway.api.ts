/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";

export interface GatewayService {
  id: number;
  name: string;
  url: string;
  description: string | null;
  isActive: boolean;
  loadBalanceStrategy: string;
  useSsl: boolean;
  ignoreTlsVerify: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayRoute {
  id: number;
  path: string;
  stripPath: boolean;
  serviceId: number;
  methods: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  service?: GatewayService;
}

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  description: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface GatewaySettings {
  id?: number;
  globalTimeout: number;
  enableRateLimiting: boolean;
  defaultRateLimit: number;
  enableCors: boolean;
  allowedOrigins: string;
  logLevel: "debug" | "info" | "warn" | "error";
}

export const gatewayApi = {
  // Services
  getServices: async (): Promise<GatewayService[]> => {
    const res = await apiClient.get('/admin/integration/services');
    return (res as any)?.data || [];
  },
  createService: async (data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.post('/admin/integration/services', data);
    return (res as any)?.data;
  },
  updateService: async (id: number, data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.put(`/admin/integration/services/${id}`, data);
    return (res as any)?.data;
  },
  deleteService: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/integration/services/${id}`);
  },

  // Routes
  getRoutes: async (): Promise<GatewayRoute[]> => {
    const res = await apiClient.get('/admin/integration/routes');
    return (res as any)?.data || [];
  },
  createRoute: async (data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.post('/admin/integration/routes', data);
    return (res as any)?.data;
  },
  updateRoute: async (id: number, data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.put(`/admin/integration/routes/${id}`, data);
    return (res as any)?.data;
  },
  deleteRoute: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/integration/routes/${id}`);
  },

  // ApiKeys
  getApiKeys: async (): Promise<ApiKey[]> => {
    const res = await apiClient.get('/admin/integration/apikeys');
    return (res as any)?.data || [];
  },
  createApiKey: async (data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.post('/admin/integration/apikeys', data);
    return (res as any)?.data;
  },
  updateApiKey: async (id: number, data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.put(`/admin/integration/apikeys/${id}`, data);
    return (res as any)?.data;
  },
  deleteApiKey: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/integration/apikeys/${id}`);
  },

  // Settings
  getSettings: async (): Promise<GatewaySettings> => {
    const res = await apiClient.get('/admin/integration/settings');
    return (res as any)?.data || {};
  },
  updateSettings: async (data: Partial<GatewaySettings>): Promise<GatewaySettings> => {
    const res = await apiClient.put('/admin/integration/settings', data);
    return (res as any)?.data;
  }
};
