"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationApi } from "../../../api";
import { organizationQueryKeys } from "../../../constants/queryKeys";

export function useStaffingMutations(unitId: number | null) {
  const queryClient = useQueryClient();

  const setStaffing = useMutation({
    mutationFn: (payload: { unitId: number; jobTitleId: number; quantity: number }) =>
      organizationApi.setStaffing(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.staffingReport(variables.unitId),
      });
      toast.success("Đã cập nhật định biên.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể cập nhật định biên.";
      toast.error(msg);
    },
  });

  const setStaffingSlot = useMutation({
    mutationFn: (payload: {
      staffingId: number;
      slotOrder: number;
      description?: string;
      geographicAreaId?: number;
      domainIds?: number[];
      monitoredUnitIds?: number[];
    }) => organizationApi.setStaffingSlot(payload),
    onSuccess: () => {
      if (unitId != null) {
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.staffingReport(unitId),
        });
      }
      toast.success("Đã lưu phân công vị trí.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể lưu phân công vị trí.";
      toast.error(msg);
    },
  });

  const updateJobTitle = useMutation({
    mutationFn: (params: {
      id: number;
      domainId?: number;
      geographicAreaId?: number;
      monitoredUnitIds?: number[];
    }) =>
      organizationApi.updateJobTitle(params.id, {
        domainId: params.domainId,
        geographicAreaId: params.geographicAreaId,
        monitoredUnitIds: params.monitoredUnitIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.jobTitles(unitId ?? undefined),
      });
      if (unitId != null) {
        queryClient.invalidateQueries({
          queryKey: organizationQueryKeys.staffingReport(unitId),
        });
      }
      toast.success("Đã cập nhật cấu hình chức danh.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể cập nhật chức danh.";
      toast.error(msg);
    },
  });

  return {
    setStaffing,
    setStaffingSlot,
    updateJobTitle,
  };
}
