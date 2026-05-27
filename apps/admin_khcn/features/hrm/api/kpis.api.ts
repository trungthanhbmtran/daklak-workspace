import apiClient from "@/lib/axiosInstance";


export const hrmKpiCriteriaApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get('/hrm/kpis/criteria', { params }).then((res: any) => {
      const data = res.data || [];
      return {
        data,
        meta: res.meta || { pagination: { total: data.length, page: 1, pageSize: 20, totalPages: 1 } }
      };
    });
  },

  create(payload: any): Promise<{ success: boolean; data?: any }> {
    return apiClient.post('/hrm/kpis/criteria', payload).then((res: any) => ({
      success: true,
      data: res
    }));
  },

  update(id: number, payload: any): Promise<{ success: boolean; data?: any }> {
    return apiClient.put(`/hrm/kpis/criteria/${id}`, payload).then((res: any) => ({
      success: true,
      data: res
    }));
  },

  deleteOne(id: number): Promise<{ success: boolean }> {
    return apiClient.delete(`/hrm/kpis/criteria/${id}`).then((res: any) => ({
      success: res?.success ?? true
    }));
  }
};

export const hrmKpiPlansApi = {
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/kpi-plans', payload).then((res: any) => res);
  }
};

export const hrmKpiEvaluationsApi = {
  list(params: any = {}): Promise<{ data: any; meta: any }> {
    return apiClient.get('/hrm/kpi-evaluations', { params }).then((res: any) => ({
      data: res.data || {},
      meta: res.meta || { pagination: { total: 0 } }
    }));
  }
};
