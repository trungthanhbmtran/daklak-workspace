import apiClient from "@/lib/axiosInstance";

export interface RankQuotaPayload {
  taskName: string;
  unit: string;
  targetValue: number;
  weight: number;
}

export const hrmRankQuotasApi = {
  save: (rankCode: string, quotas: RankQuotaPayload[]): Promise<any> => {
    return apiClient.post('/hrm/rank-quotas', { rankCode, quotas }).then((res: any) => res);
  },
  getByRank: (rankCode: string): Promise<any> => {
    return apiClient.get(`/hrm/rank-quotas/${rankCode}`).then((res: any) => res);
  }
};
