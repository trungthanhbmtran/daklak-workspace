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

  const unitName = useMemo(() => {
    if (!employee?.departmentId) return employee?.department?.name ?? "—";
    if (!Array.isArray(treeNodes)) return employee?.department?.name ?? "—";
    const flat = flattenUnits(treeNodes);
    const found = flat.find((u) => u.id === employee.departmentId);
    return found?.name ?? employee?.department?.name ?? "—";
  }, [employee, treeNodes]);

  const govtTitleName = useMemo(() => {
    const title = employee?.jobTitle;
    if (title) return title.name;
    if (!employee?.jobTitleId) return "—";
    const items = jobTitlesRes?.items ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.jobTitleId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const rankTitleName = useMemo(() => {
    const rank = employee?.civilServantRank;
    if (rank) return rank.name;
    if (!employee?.civilServantRankId) return "—";
    const items = jobTitlesRes?.items ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.civilServantRankId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const partyTitleName = useMemo(() => {
    const party = employee?.partyTitle;
    if (party) return party.name;
    if (!employee?.partyTitleId) return "—";
    const items = jobTitlesRes?.items ?? [];
    const found = items.find((j: { id: number }) => j.id === employee.partyTitleId);
    return found?.name ?? "—";
  }, [employee, jobTitlesRes]);

  const mainTitleName = useMemo(() => {
    if (govtTitleName !== "—") return govtTitleName;
    if (rankTitleName !== "—") return rankTitleName;
    return "Nhân sự";
  }, [govtTitleName, rankTitleName]);

  return {
    unitName,
    govtTitleName,
    rankTitleName,
    partyTitleName,
    mainTitleName,
  };
}
