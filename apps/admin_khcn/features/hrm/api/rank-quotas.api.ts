import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export interface RankQuotaPayload {
  taskName: string;
  unit: string;
  targetValue: number;
  weight: number;
}

export const hrmRankQuotasApi = {
  save: (rankCode: string, quotas: RankQuotaPayload[]): Promise<ApiResponse<any>> =>
    apiClient.post('/hrm/rank-quotas', { rankCode, quotas }) as any,

  getByRank: (rankCode: string): Promise<ApiResponse<any>> =>
    apiClient.get(`/hrm/rank-quotas/${rankCode}`) as any,
};
