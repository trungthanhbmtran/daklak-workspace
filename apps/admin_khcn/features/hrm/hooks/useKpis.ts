"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmKpiPlansApi, hrmKpiEvaluationsApi, hrmKpiCriteriaApi } from "../api";
import { hrmKeys } from "../keys";

export function useKpiCriteriaList(params?: any) {
  return useQuery({
    queryKey: hrmKeys.kpis(),
    queryFn: () => hrmKpiCriteriaApi.list(params).then(res => res.data || []),
  });
}

export function useCreateKpiCriterion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => hrmKpiCriteriaApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpis() });
    },
  });
}

export function useUpdateKpiCriterion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => hrmKpiCriteriaApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpis() });
    },
  });
}

export function useDeleteKpiCriterion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => hrmKpiCriteriaApi.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpis() });
    },
  });
}

export function useCreateKpiPlan() {
  const queryClient = useQueryClient();
  return useMutation({
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
    mutationFn: (payload: { periodId: number; employeeCode?: string }) => hrmKpiEvaluationsApi.calculatePersonal(payload),
    onSuccess: (_, variables) => {
      // Invalidate the evaluations query
      queryClient.invalidateQueries({ queryKey: hrmKeys.kpiEvaluations(variables.periodId.toString()) });
    }
  });
}
