"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationApi } from "../../../api";
import { organizationQueryKeys } from "../../../constants/queryKeys";
import type { StaffingReportItem } from "../../../types";

const STALE = 60 * 1000;
const GC    = 5 * 60 * 1000;

export function useStaffingData(unitId: number | null) {
  const reportQuery = useQuery({
    queryKey: organizationQueryKeys.staffingReport(unitId!),
    queryFn: () => organizationApi.getStaffingReport(unitId!),
    enabled: unitId != null,
    staleTime: STALE,
    gcTime: GC,
  });

  const jobTitlesQuery = useQuery({
    queryKey: organizationQueryKeys.jobTitles(unitId ?? undefined),
    queryFn: () => organizationApi.getJobTitles(unitId ?? undefined),
    enabled: unitId != null,
    staleTime: STALE,
    gcTime: GC,
  });

  const report = reportQuery.data?.allReport ?? [];
  const partyReport = reportQuery.data?.partyReport ?? [];
  const govReport = reportQuery.data?.govReport ?? [];
  
  const jobTitles = jobTitlesQuery.data?.data?.allTitles ?? [];
  const partyTitles = jobTitlesQuery.data?.data?.partyTitles ?? [];
  const govTitles = jobTitlesQuery.data?.data?.govTitles ?? [];

  return {
    report,
    partyReport,
    govReport,
    jobTitles,
    partyTitles,
    govTitles,
    isLoadingReport: reportQuery.isPending || reportQuery.isFetching,
    isLoadingJobTitles: jobTitlesQuery.isPending || jobTitlesQuery.isFetching,
    isError: reportQuery.isError || jobTitlesQuery.isError,
    refetch: reportQuery.refetch,
  };
}

export function useStaffingActions(unitId: number | null) {
  const queryClient = useQueryClient();

  function invalidateAll() {
    if (unitId != null) {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.staffingReport(unitId) });
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.jobTitles(unitId) });
    }
  }

  const setStaffing = useMutation({
    mutationFn: (p: { unitId: number; jobTitleId: number; quantity: number }) =>
      organizationApi.setStaffing(p),
    onSuccess: () => { invalidateAll(); toast.success("Da cap nhat dinh bien."); },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Khong the cap nhat dinh bien.");
    },
  });

  const setStaffingSlot = useMutation({
    mutationFn: (p: { staffingId: number; slotOrder: number; description?: string; geographicAreaIds?: number[]; domainIds?: number[]; monitoredUnitIds?: number[] }) =>
      organizationApi.setStaffingSlot(p),
    onSuccess: () => { invalidateAll(); toast.success("Da luu phan cong vi tri."); },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Khong the luu phan cong.");
    },
  });

  const updateJobTitle = useMutation({
    mutationFn: (p: { id: number; domainId?: number }) =>
      organizationApi.updateJobTitle(p.id, { domainId: p.domainId }),
    onSuccess: () => { invalidateAll(); toast.success("Da cap nhat chuc danh."); },
    onError: (err: unknown) => {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Khong the cap nhat.");
    },
  });

  return { setStaffing, setStaffingSlot, updateJobTitle };
}
