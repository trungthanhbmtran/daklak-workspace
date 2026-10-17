/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import type {
  OrganizationUnitNode,
  CreateUnitPayload,
  UpdateUnitPayload,
  JobTitleItem,
  StaffingReportItem,
  SetStaffingPayload,
  SetStaffingSlotPayload,
  UpdateJobTitlePayload,
} from "./types";

export const organizationApi = {
  getOrganizations: (q?: string): Promise<OrganizationUnitNode[]> =>
    apiClient.get("/organizations", { params: { q: q || undefined } }).then((r: any) => unwrapData<OrganizationUnitNode[]>(r, [])),

  getTree: (q?: string): Promise<OrganizationUnitNode[]> =>
    apiClient.get("/organizations/tree", { params: { q: q || undefined } }).then((r: any) => unwrapData<OrganizationUnitNode[]>(r, [])),

  getDetail: (identifier: string): Promise<OrganizationUnitNode> =>
    apiClient.get(`/organizations/detail/${encodeURIComponent(identifier)}`).then((r: any) => unwrapData<OrganizationUnitNode>(r, {} as OrganizationUnitNode)),

  getScope: (id: number): Promise<{ domains: { id: number; name: string }[]; domainIds: number[]; scope: string }> =>
    apiClient.get(`/organizations/${id}/scope`).then((r: any) => {
      const d = unwrapData<any>(r, {});
      return {
        domains: d?.domains ?? [],
        domainIds: d?.domainIds ?? [],
        scope: d?.scope,
      };
    }),

  createUnit: (payload: CreateUnitPayload) =>
    apiClient.post("/organizations", payload).then((r: any) => unwrapData<any>(r, r)),

  updateUnit: (id: number, payload: UpdateUnitPayload) =>
    apiClient.put(`/organizations/${id}`, payload).then((r: any) => unwrapData<any>(r, r)),

  deleteUnit: (id: number) =>
    apiClient.delete(`/organizations/${id}`).then((r: any) => unwrapData<any>(r, r)),

  getDomains: (q?: string, selectedIds?: number[], skip: number = 0, parentUnitId?: number) =>
    apiClient
      .get("/categories", {
        params: {
          group: "DOMAIN",
          q: q || "",
          limit: 15,
          skip,
          ...(selectedIds?.length ? { selectedIds: selectedIds.join(',') } : {}),
          ...(parentUnitId ? { parentUnitId } : {}),
        },
      })
      .then((r: any) => unwrapData(r, [])),

  getGeographicAreas: (q?: string, selectedIds?: number[], skip: number = 0) =>
    apiClient
      .get("/categories", {
        params: {
          group: "GEO_AREA",
          q: q || "",
          limit: 15,
          skip,
          ...(selectedIds?.length ? { selectedIds: selectedIds.join(',') } : {}),
        },
      })
      .then((r: any) => unwrapData(r, [])),

  updateScope: (id: number, payload: { domainIds?: number[] }) =>
    apiClient.put(`/organizations/${id}/scope`, payload).then((r: any) => unwrapData(r, r)),

  getJobTitles: (unitId?: number): Promise<{ partyTitles: JobTitleItem[]; govTitles: JobTitleItem[]; allTitles: JobTitleItem[] }> =>
    apiClient
      .get("/organizations/job-titles", unitId != null ? { params: { unitId } } : undefined)
      .then((r: any) => {
        const data = unwrapData<any>(r, {});
        return {
          partyTitles: data.partyTitles || [],
          govTitles: data.govTitles || [],
          allTitles: data.allTitles || [],
        };
      }),

  updateJobTitle: (id: number, payload: UpdateJobTitlePayload) =>
    apiClient.put(`/organizations/job-titles/${id}`, payload).then((r: any) => unwrapData(r, r)),

  setStaffing: (payload: SetStaffingPayload) =>
    apiClient.post("/organizations/staffing", payload).then((r: any) => unwrapData(r, r)),

  setStaffingSlot: (payload: SetStaffingSlotPayload) =>
    apiClient.post("/organizations/staffing-slots", payload).then((r: any) => unwrapData(r, r)),

  getUnitTypes: (): Promise<any> =>
    apiClient.get("/organizations/unit-types").then((r: any) => unwrapData<any[]>(r, [])),

  getUnitTypeJobTemplates: (unitTypeId: number): Promise<number[]> =>
    apiClient.get(`/organizations/unit-types/${unitTypeId}/job-templates`).then((r: any) => unwrapData<number[]>(r, [])),

  updateUnitTypeJobTemplates: (unitTypeId: number, jobTitleIds: number[]) =>
    apiClient.put(`/organizations/unit-types/${unitTypeId}/job-templates`, { jobTitleIds }).then((r: any) => unwrapData(r, r)),

  getJobTitleGroups: () =>
    apiClient.get("/categories", { params: { group: "JOB_TITLE_GROUP", limit: 100 } }).then((r: any) => unwrapData(r, [])),

  /**
   * Lấy báo cáo định biên của một đơn vị: số lượng chỉ tiêu, hiện tại, slot từng vị trí
   */
  getStaffingReport: (
    unitId: number
  ): Promise<{
    data: StaffingReportItem[];
    partyReport: StaffingReportItem[];
    govReport: StaffingReportItem[];
    allReport: StaffingReportItem[];
  }> =>
    apiClient.get(`/organizations/${unitId}/staffing-report`).then((r: any) => {
      const d = unwrapData<any>(r, {});
      const all = d?.allReport || (Array.isArray(d) ? d : []);
      return {
        data: all,
        partyReport: d?.partyReport || [],
        govReport: d?.govReport || [],
        allReport: all,
      };
    }),
};
