/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmPlansApi } from "../api";
import { hrmKeys } from "../keys";
import { toast } from "sonner";

export function useCreateMasterPlan() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: any) => hrmPlansApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.masterPlans() });
    },
  });
}
