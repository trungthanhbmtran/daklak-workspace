/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { organizationApi } from "@/features/system-admin/organization/api";

export function flattenUnits(nodes: unknown[], acc: { id: number; name: string }[] = []): { id: number; name: string }[] {
  for (const n of nodes || []) {
    const node = n as { id?: number; name?: string; children?: unknown[] };
    if (node.id != null) acc.push({ id: node.id, name: node.name ?? "" });
    flattenUnits(node.children ?? [], acc);
  }
  return acc;
}

export function useEmployeeTitles(employee: any) {
  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });
  const { data: jobTitlesRes } = useQuery({
    queryKey: ["organizations", "job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
  });

  const { data: staffingReport } = useQuery({
    queryKey: ["staffing-report", employee?.departmentId],
    queryFn: () => organizationApi.getStaffingReport(employee.departmentId),
    enabled: !!employee?.departmentId,
    staleTime: 60 * 1000,
  });

  const unitName = useMemo(() => {
    if (!employee?.departmentId) return employee?.department?.name ?? "—";
    const rawTree = Array.isArray(treeNodes) ? treeNodes : (treeNodes as any)?.data ?? [];
    if (!Array.isArray(rawTree) || rawTree.length === 0) return employee?.department?.name ?? "—";
    const flat = flattenUnits(rawTree);
    const found = flat.find((u) => u.id === employee.departmentId);
    return found?.name ?? employee?.department?.name ?? "—";
  }, [employee, treeNodes]);

  const govtTitleName = useMemo(() => {
    const title = employee?.jobTitle;
    if (title) return title.name;
    if (!employee?.jobTitleId) return "—";
    const items = jobTitlesRes?.data?.allTitles ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.jobTitleId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const rankTitleName = useMemo(() => {
    const rank = employee?.civilServantRank;
    if (rank) return rank.name;
    if (!employee?.civilServantRankId) return "—";
    const items = jobTitlesRes?.data?.allTitles ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.civilServantRankId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const partyTitleName = useMemo(() => {
    const party = employee?.partyTitle;
    if (party) return party.name;
    if (!employee?.partyTitleId) return "—";
    const items = jobTitlesRes?.data?.allTitles ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.partyTitleId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const assignedSlot = useMemo(() => {
    if (!employee?.employeeCode || !staffingReport?.data) return null;
    for (const reportItem of (staffingReport.data as any[])) {
      const match = reportItem.slots?.find(
        (s: any) => s.assignedEmployeeCode === employee.employeeCode
      );
      if (match) {
        return {
          ...match,
          jobTitleName: reportItem.jobTitleName,
        };
      }
    }
    return null;
  }, [employee?.employeeCode, staffingReport]);

  const mainTitleName = useMemo(() => {
    if (assignedSlot?.description) {
      return assignedSlot.description;
    }
    if (assignedSlot?.slotOrder && assignedSlot?.jobTitleName) {
      return `${assignedSlot.jobTitleName} (Vị trí ${assignedSlot.slotOrder})`;
    }
    if (partyTitleName !== "—") return partyTitleName;
    if (govtTitleName !== "—") return govtTitleName;
    if (rankTitleName !== "—") return rankTitleName;
    return "Nhân sự";
  }, [assignedSlot, partyTitleName, govtTitleName, rankTitleName]);

  return {
    unitName,
    govtTitleName,
    rankTitleName,
    partyTitleName,
    mainTitleName,
    assignedSlot,
  };
}
