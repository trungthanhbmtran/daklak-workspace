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
    version?: number;
}

export interface KpiPreviewVariables {
    Q: number;
    C: number;
    W: number;
    D: number;
    S: number;
}

export interface KpiFormulaVersion {
    version: number;
    settingsJson: string;
    changedBy: string;
    createdAt: string;
}

export const taskKpiApi = {
    getSystemVariables: () => {
        return apiClient.get('/hrm/tasks/kpi/variables');
    },
    
    getGlobalSettings: () => {
        return apiClient.get('/hrm/tasks/kpi/global-settings');
    },

    saveGlobalSettings: (data: GlobalKpiSettings) => {
        return apiClient.put('/hrm/tasks/kpi/global-settings', data);
    },

    previewGlobalSettings: (data: { settings: GlobalKpiSettings; variables: KpiPreviewVariables; domainCode?: string }) => {
        return apiClient.post('/hrm/tasks/kpi/preview', data);
    },

    getGlobalSettingVersions: () => {
        return apiClient.get('/hrm/tasks/kpi/global-settings/versions');
    }
};
