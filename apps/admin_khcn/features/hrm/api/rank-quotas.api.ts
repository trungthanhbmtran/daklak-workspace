/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export interface RankQuotaPayload {
  id?: string | number;
  taskName: string;
  unit: string;
  targetValue: number;
  monthlyTarget: number;
  quarterlyTarget: number;
  yearlyTarget: number;
  weight: number;
  departmentId?: number;
  unitCode?: string;
}

export interface AiSuggestedQuotaItem {
  taskName: string;
  unit: string;
  monthlyTarget: number;
  quarterlyTarget: number;
  yearlyTarget: number;
  weight: number;
  outputProduct?: string;
  rationale?: string;
}

export interface AiSuggestQuotaPayload {
  unitName?: string;
  unitCode?: string;
  rankName: string;
  rankCode: string;
  classification?: 'CONG_CHUC' | 'VIEN_CHUC' | 'DANG';
  domainCode?: string;
  targetScope: 'INDIVIDUAL' | 'UNIT';
  goalOrientation?: 'STANDARD' | 'INTENSIVE' | 'DIGITAL_TRANSFORMATION';
  headcount?: number;
}

export interface AiSuggestQuotaResult {
  targetScope: 'INDIVIDUAL' | 'UNIT';
  goalOrientation: string;
  unitName: string;
  rankName: string;
  strategicGoal: string;
  rationale: string;
  suggestedQuotas: AiSuggestedQuotaItem[];
  suggestedPlan?: {
    title: string;
    phases: Array<{
      phase: string;
      focus: string;
      expectedOutput: string;
    }>;
  };
}

export const hrmRankQuotasApi = {
  save: (
    rankCode: string,
    domainCode: string,
    quotas: RankQuotaPayload[],
    departmentId?: number,
    unitCode?: string,
  ): Promise<ApiResponse<any>> =>
    apiClient.post('/hrm/rank-quotas', {
      rankCode,
      domainCode,
      quotas,
      departmentId,
      unitCode,
    }) as any,

  getByRank: (
    rankCode: string,
    domainCode?: string,
    departmentId?: number,
    unitCode?: string,
  ): Promise<ApiResponse<any>> =>
    apiClient.get(`/hrm/rank-quotas/${rankCode}`, {
      params: {
        domainCode,
        departmentId: departmentId || undefined,
        unitCode: unitCode || undefined,
      },
    }) as any,

  aiSuggest: (
    payload: AiSuggestQuotaPayload,
  ): Promise<ApiResponse<AiSuggestQuotaResult>> =>
    apiClient.post('/hrm/rank-quotas/ai-suggest', payload) as any,
};
