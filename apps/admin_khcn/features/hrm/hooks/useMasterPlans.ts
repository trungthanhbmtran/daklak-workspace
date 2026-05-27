"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmPlansApi } from "../api";
import { hrmKeys } from "../keys";

export function useCreateMasterPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => hrmPlansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.masterPlans() });
    },
  });
}
