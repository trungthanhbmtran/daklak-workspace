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

export const gatewayApi = {
  // Services
  getServices: async (): Promise<GatewayService[]> => {
    const res = await apiClient.get('/integration/services');
    return (res as any)?.data || [];
  },
  createService: async (data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.post('/integration/services', data);
    return (res as any)?.data;
  },
  updateService: async (id: number, data: Partial<GatewayService>): Promise<GatewayService> => {
    const res = await apiClient.put(`/integration/services/${id}`, data);
    return (res as any)?.data;
  },
  deleteService: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/services/${id}`);
  },

  // Routes
  getRoutes: async (): Promise<GatewayRoute[]> => {
    const res = await apiClient.get('/integration/routes');
    return (res as any)?.data || [];
  },
  createRoute: async (data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.post('/integration/routes', data);
    return (res as any)?.data;
  },
  updateRoute: async (id: number, data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    const res = await apiClient.put(`/integration/routes/${id}`, data);
    return (res as any)?.data;
  },
  deleteRoute: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/routes/${id}`);
  },

  // ApiKeys
  getApiKeys: async (): Promise<ApiKey[]> => {
    const res = await apiClient.get('/integration/apikeys');
    return (res as any)?.data || [];
  },
  createApiKey: async (data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.post('/integration/apikeys', data);
    return (res as any)?.data;
  },
  updateApiKey: async (id: number, data: Partial<ApiKey>): Promise<ApiKey> => {
    const res = await apiClient.put(`/integration/apikeys/${id}`, data);
    return (res as any)?.data;
  },
  deleteApiKey: async (id: number): Promise<void> => {
    await apiClient.delete(`/integration/apikeys/${id}`);
  }
};
