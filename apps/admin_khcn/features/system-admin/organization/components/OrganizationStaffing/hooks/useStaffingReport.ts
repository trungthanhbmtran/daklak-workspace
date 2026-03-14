"use client";

import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../../../api";
import { organizationQueryKeys, categoryQueryKeys } from "../../../constants/queryKeys";
import type { StaffingReportItem } from "../../../types";

const STALE_TIME = 60 * 1000; // 1 phút
const GC_TIME = 5 * 60 * 1000; // 5 phút

function parseCategoryList(res: unknown): { id: number; name: string }[] {
  return Array.isArray(res) ? res : (res as { data?: { id: number; name: string }[] })?.data ?? [];
}

export function useStaffingReport(unitId: number | null) {
  const reportQuery = useQuery({
    queryKey: organizationQueryKeys.staffingReport(unitId!),
    queryFn: () => organizationApi.getStaffingReport(unitId!),
    enabled: unitId != null,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const jobTitlesQuery = useQuery({
    queryKey: organizationQueryKeys.jobTitles(unitId ?? undefined),
    queryFn: () => organizationApi.getJobTitles(unitId ?? undefined),
    enabled: unitId != null,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const geoAreasQuery = useQuery({
    queryKey: categoryQueryKeys.geoAreas(),
    queryFn: () => organizationApi.getGeoAreas(),
    enabled: unitId != null,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const report: StaffingReportItem[] = Array.isArray(reportQuery.data)
    ? reportQuery.data
    : [];
  const jobTitles = jobTitlesQuery.data?.items ?? [];
  const geoAreas = parseCategoryList(geoAreasQuery.data ?? []);

  return {
    report,
    jobTitles,
    geoAreas,
    isLoadingReport: reportQuery.isLoading,
    isLoadingJobTitles: jobTitlesQuery.isLoading,
    isError: reportQuery.isError || jobTitlesQuery.isError,
    refetchReport: reportQuery.refetch,
  };
}
