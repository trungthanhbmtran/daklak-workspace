import apiClient from "@/lib/axiosInstance";

export interface GatewayRoute {
  id: string;
  gatewayId: string;
  path: string;
  targetService: string;
  stripPrefix: boolean;
  rateLimit: number | null;
  timeout: number | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayConfig {
  id: string;
  name: string;
  provider: string;
  httpPort: number;
  httpsPort: number;
  enableHttps: boolean;
  sslCert: string | null;
  sslKey: string | null;
  rawConfig: string | null;
  isActive: boolean;
  version: number;
  routes: GatewayRoute[];
  createdAt: string;
  updatedAt: string;
}

export const gatewayApi = {
  getGatewayConfigs: async (): Promise<GatewayConfig[]> => {
    return apiClient.get('/gateway');
  },

  getGatewayConfigById: async (id: string): Promise<GatewayConfig> => {
    return apiClient.get(`/gateway/${id}`);
  },

  createGatewayConfig: async (data: Partial<GatewayConfig>): Promise<GatewayConfig> => {
    return apiClient.post('/gateway', data);
  },

  updateGatewayConfig: async (id: string, data: Partial<GatewayConfig>): Promise<GatewayConfig> => {
    return apiClient.patch(`/gateway/${id}`, data);
  },

  deleteGatewayConfig: async (id: string): Promise<void> => {
    return apiClient.delete(`/gateway/${id}`);
  },

  addRoute: async (gatewayId: string, data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    return apiClient.post(`/gateway/${gatewayId}/routes`, data);
  },

  updateRoute: async (routeId: string, data: Partial<GatewayRoute>): Promise<GatewayRoute> => {
    return apiClient.patch(`/gateway/routes/${routeId}`, data);
  },

  deleteRoute: async (routeId: string): Promise<void> => {
    return apiClient.delete(`/gateway/routes/${routeId}`);
  },
};
