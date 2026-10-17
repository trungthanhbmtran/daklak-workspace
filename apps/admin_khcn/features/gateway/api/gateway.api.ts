/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";

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
    const res = await apiClient.get('/integration/services');
    return unwrapData<GatewayService[]>(res, []);
  },
  createService: async (data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.post('/integration/services', data);
    return unwrapData<GatewayService>(res);
  },
  updateService: async (id: number, data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.put(`/integration/services/${id}`, data);
    return unwrapData<GatewayService>(res);
  },
  deleteService: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/services/${id}`);
  },

  // Routes
  getRoutes: async (): Promise<GatewayRoute[]> => {
    const res = await apiClient.get('/integration/routes');
    return unwrapData<GatewayRoute[]>(res, []);
  },
  createRoute: async (data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.post('/integration/routes', data);
    return unwrapData<GatewayRoute>(res);
  },
  updateRoute: async (id: number, data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.put(`/integration/routes/${id}`, data);
    return unwrapData<GatewayRoute>(res);
  },
  deleteRoute: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/routes/${id}`);
  },

  // ApiKeys
  getApiKeys: async (): Promise<ApiKey[]> => {
    const res = await apiClient.get('/integration/apikeys');
    return unwrapData<ApiKey[]>(res, []);
  },
  createApiKey: async (data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.post('/integration/apikeys', data);
    return unwrapData<ApiKey>(res);
  },
  updateApiKey: async (id: number, data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.put(`/integration/apikeys/${id}`, data);
    return unwrapData<ApiKey>(res);
  },
  deleteApiKey: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/apikeys/${id}`);
  },

  // Settings
  getSettings: async (): Promise<GatewaySettings> => {
    const res = await apiClient.get('/integration/settings');
    return unwrapData<GatewaySettings>(res, {} as GatewaySettings);
  },
  updateSettings: async (data: Partial<GatewaySettings>): Promise<GatewaySettings> => {
    const res = await apiClient.put('/integration/settings', data);
    return unwrapData<GatewaySettings>(res);
  }
};
