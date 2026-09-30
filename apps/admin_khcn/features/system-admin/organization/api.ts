/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
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
  getOrganizations: (q?: string): Promise<{ data: OrganizationUnitNode[] }> =>
    apiClient.get("/organizations", { params: { q: q || undefined } }).then((r: any) => ({
      data: r?.data ?? [],
    })),

  getTree: (q?: string): Promise<{ data: OrganizationUnitNode[] }> =>
    apiClient.get("/organizations/tree", { params: { q: q || undefined } }).then((r: any) => ({
      data: r?.data ?? [],
    })),


  getDetail: (identifier: string): Promise<{ data: OrganizationUnitNode }> => apiClient.get(`/organizations/detail/${encodeURIComponent(identifier)}`).then((r: any) => ({
      data: r?.data ?? r,
    })),

  getScope: (id: number): Promise<{ data: { domains: { id: number; name: string }[], domainIds: number[], scope: string } }> =>
    apiClient.get(`/organizations/${id}/scope`).then((r: any) => ({
      data: {
        domains: r?.data?.domains ?? [],
        domainIds: r?.data?.domainIds ?? [],
        scope: r?.data?.scope,
      }
    })),

  createUnit: (payload: CreateUnitPayload) =>
    apiClient.post("/organizations", payload).then((r: any) => r?.data ?? r),

  updateUnit: (id: number, payload: UpdateUnitPayload) =>
    apiClient.put(`/organizations/${id}`, payload).then((r: any) => r?.data ?? r),

  deleteUnit: (id: number) =>
    apiClient.delete(`/organizations/${id}`).then((r: any) => r?.data ?? r),

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
      .then((r: any) => r?.data ?? r),

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
      .then((r: any) => r?.data ?? r),

  updateScope: (id: number, payload: { domainIds?: number[] }) =>
    apiClient.put(`/organizations/${id}/scope`, payload).then((r: any) => r?.data ?? r),

  getJobTitles: (unitId?: number): Promise<{ data: { partyTitles: JobTitleItem[], govTitles: JobTitleItem[], allTitles: JobTitleItem[] } }> =>
    apiClient
      .get("/organizations/job-titles", unitId != null ? { params: { unitId } } : undefined)
      .then((r: any) => {
        const data = r?.data ?? r;
        return {
          data: {
            partyTitles: data.partyTitles || [],
            govTitles: data.govTitles || [],
            allTitles: data.allTitles || [],
          }
        };
      }),

  updateJobTitle: (id: number, payload: UpdateJobTitlePayload) =>
    apiClient.put(`/organizations/job-titles/${id}`, payload).then((r: any) => r?.data ?? r),

  setStaffing: (payload: SetStaffingPayload) =>
    apiClient.post("/organizations/staffing", payload).then((r: any) => r?.data ?? r),

  getStaffingReport: (unitId: number): Promise<{ partyReport: StaffingReportItem[], govReport: StaffingReportItem[], allReport: StaffingReportItem[] }> =>
    apiClient
      .get(`/organizations/${unitId}/staffing-report`)
      .then((r: any) => {
        const data = r?.data ?? r;
        return {
          partyReport: data.partyReport || [],
          govReport: data.govReport || [],
          allReport: data.allReport || [],
        };
      }),

  setStaffingSlot: (payload: SetStaffingSlotPayload) =>
    apiClient.post("/organizations/staffing-slots", payload).then((r: any) => r?.data ?? r),

  getUnitTypes: (): Promise<{ data: any[] }> =>
    apiClient.get("/organizations/unit-types").then((r: any) => ({
      data: r?.data ?? [],
    })),

  getUnitTypeJobTemplates: (unitTypeId: number): Promise<{ data: number[] }> =>
    apiClient.get(`/organizations/unit-types/${unitTypeId}/job-templates`).then((r: any) => ({
      data: r?.data?.data || r?.data || [],
    })),

  updateUnitTypeJobTemplates: (unitTypeId: number, jobTitleIds: number[]) =>
    apiClient.put(`/organizations/unit-types/${unitTypeId}/job-templates`, { jobTitleIds }).then((r: any) => r?.data ?? r),

  getJobTitleGroups: () =>
    apiClient.get("/categories", { params: { group: "JOB_TITLE_GROUP", limit: 100 } }).then((r: any) => ({
      data: r?.data?.data || r?.data || [],
    })),
};
