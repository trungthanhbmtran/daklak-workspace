"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmKpiPlansApi, hrmKpiEvaluationsApi } from "../api";
import { hrmKeys } from "../keys";

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
