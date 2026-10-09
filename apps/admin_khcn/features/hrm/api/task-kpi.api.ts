import apiClient from '@/lib/axiosInstance';

export interface VariableDef {
    code: string;
    name: string;
    description: string;
}

export interface CustomRule {
    domainCode: string;
    formula: string;
    name?: string;
}

export interface GlobalKpiSettings {
    baseFormula: string;
    enableQualityScore: boolean;
    qualityWeight: number;
    enablePenalty: boolean;
    penaltyPerDay: number;
    customRules: CustomRule[];
}

export const taskKpiApi = {
    getSystemVariables: () => {
        return apiClient.get('/admin/hrm/tasks/kpi/variables');
    },
    
    getGlobalSettings: () => {
        return apiClient.get('/admin/hrm/tasks/kpi/global-settings');
    },

    saveGlobalSettings: (data: GlobalKpiSettings) => {
        return apiClient.put('/admin/hrm/tasks/kpi/global-settings', data);
    }
};
