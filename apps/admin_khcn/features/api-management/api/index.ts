import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";

export interface AuthBinding {
  kind: 'none' | 'basic' | 'apiKey' | 'bearer' | 'oauth2' | 'lgsp' | 'mtls';
  secretRef?: string;
  secret?: string;
  clientId?: string;
  tokenUrl?: string;
  headerName?: string;
  headerPrefix?: string;
  scope?: string;
}

export interface ApiConnection {
  id: string;
  code: string;
  displayName: string;
  networkZone: 'internal' | 'external';
  baseUrl: string;
  auth: AuthBinding;
  timeoutMs: number;
  organizationId: string;
  enabled: boolean;
  version: number;
  endpoints?: ApiEndpoint[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpoint {
  id: string;
  connectionId: string;
  method: string;
  pathTemplate: string;
  schema?: string;
}

export const apiManagementApi = {
  getConnections: async (params?: { search?: string; limit?: number; offset?: number }) => {
    try {
      const res = await apiClient.get('/api-management/connections', { params }) as any;
      return unwrapData<ApiConnection[]>(res, []);
    } catch {
      return [] as ApiConnection[];
    }
  },
  
  getConnection: async (id: string) => {
    const res = await apiClient.get("/api-management/connections/" + id) as any;
    return unwrapData<ApiConnection>(res);
  },

  createConnection: async (data: Partial<ApiConnection>) => {
    const res = await apiClient.post('/api-management/connections', data) as any;
    return unwrapData(res);
  },

  updateConnection: async (id: string, data: Partial<ApiConnection> & { expectedVersion?: number }) => {
    const res = await apiClient.put("/api-management/connections/" + id, data) as any;
    return unwrapData(res);
  },

  deleteConnection: async (id: string) => {
    const res = await apiClient.delete("/api-management/connections/" + id) as any;
    return unwrapData(res);
  },

  createEndpoint: async (connectionId: string, data: any) => {
    const res = await apiClient.post(`/api-management/connections/${connectionId}/endpoints`, data) as any;
    return unwrapData(res);
  },

  updateEndpoint: async (endpointId: string, data: any) => {
    const res = await apiClient.put(`/api-management/connections/endpoints/${endpointId}`, data) as any;
    return unwrapData(res);
  },

  deleteEndpoint: async (endpointId: string) => {
    const res = await apiClient.delete(`/api-management/connections/endpoints/${endpointId}`) as any;
    return unwrapData(res);
  },

  disableConnection: async (id: string, expectedVersion: number) => {
    const res = await apiClient.put("/api-management/connections/" + id + "/disable", { expectedVersion }) as any;
    return unwrapData(res);
  },

  publishRevision: async () => {
    const res = await apiClient.post('/api-management/connections/publish') as any;
    return unwrapData(res);
  },

  uploadImport: async (file: File, targetConnectionId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetConnectionId) formData.append('targetConnectionId', targetConnectionId);
    
    const res = await apiClient.post('/api-management/connections/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as any;
    return unwrapData(res); // { sessionId, inputHash, diffs: [{ method, path, status }] }
  },

  commitImport: async (sessionId: string, resolutions: { method: string, path: string, action: 'OVERWRITE' | 'SKIP' }[]) => {
    const res = await apiClient.post('/api-management/connections/import/commit', { sessionId, resolutions }) as any;
    return unwrapData(res);
  },

  testConnection: async (id: string): Promise<{
    success: boolean;
    statusCode: number;
    latencyMs: number;
    message: string;
    authModel: string;
  }> => {
    const res = (await apiClient.post(`/api-management/connections/${id}/test-connection`)) as any;
    return unwrapData(res);
  },
};
