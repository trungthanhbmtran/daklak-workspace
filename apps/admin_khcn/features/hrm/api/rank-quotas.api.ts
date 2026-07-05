import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export interface RankQuotaPayload {
  taskName: string;
  unit: string;
  targetValue: number;
  weight: number;
}

export const hrmRankQuotasApi = {
  save: (rankCode: string, domainCode: string, quotas: RankQuotaPayload[]): Promise<ApiResponse<any>> =>
    apiClient.post('/hrm/rank-quotas', { rankCode, domainCode, quotas }) as any,

  getByRank: (rankCode: string, domainCode?: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/hrm/rank-quotas/${rankCode}`, { params: { domainCode } }) as any,
};
