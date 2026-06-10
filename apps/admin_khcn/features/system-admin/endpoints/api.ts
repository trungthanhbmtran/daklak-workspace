import apiClient from '@/lib/axiosInstance';

export const endpointApi = {
  getEndpoints: async () => {
    return apiClient.get('/roles/endpoints');
  },
  assignPermission: async (endpointId: number, permissionId: number) => {
    return apiClient.put(`/roles/endpoints/${endpointId}/permission`, { permissionId });
  },
};
