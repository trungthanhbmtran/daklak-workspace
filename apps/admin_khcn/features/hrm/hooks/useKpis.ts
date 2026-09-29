/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmKpiPlansApi, hrmKpiEvaluationsApi } from "../api";
import { hrmKeys } from "../keys";
import { toast } from "sonner";


export function useCreateKpiPlan() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: any) => hrmKpiPlansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpiPlans() });
    },
  });
}

export function useKpiEvaluations(period: string) {
  return useQuery({
    queryKey: hrmKeys.kpiEvaluations(period),
    queryFn: () => hrmKpiEvaluationsApi.list({ period }),
    enabled: !!period,
  });
}

export function useCalculatePersonalKpi() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: { periodId: number; employeeCode?: string }) => hrmKpiEvaluationsApi.calculatePersonal(payload),
    onSuccess: (_, variables) => {
      // Invalidate the evaluations query
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpiEvaluations(variables.periodId.toString()) });
    }
  });
}
