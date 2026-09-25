/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type {
  OrganizationUnitNode,
  CreateUnitPayload,
  UpdateUnitPayload,
  JobTitleItem,
  StaffingReportItem,
  StaffingSlotItem,
  SetStaffingPayload,
  SetStaffingSlotPayload,
  UpdateJobTitlePayload,
} from "./types";

function unwrapData<T>(res: any): T {
  return res.data as T;
}

function normalizeUnitNode(n: any): OrganizationUnitNode {
  const rawParentId = n.parentId ?? n.parent_id ?? null;
  return {
    id: n.id,
    code: n.code ?? "",
    name: n.name ?? "",
    shortName: n.shortName ?? n.short_name,
    categoryCode: n.categoryCode ?? n.category_code ?? n.typeCode ?? n.type_code ?? undefined,
    parentId: rawParentId === 0 ? null : rawParentId,
    hierarchyPath: n.hierarchyPath ?? n.hierarchy_path,
    domains: n.domains ?? [],
    subordinateUnits: Array.isArray(n.subordinateUnits || n.subordinate_units) ? (n.subordinateUnits || n.subordinate_units).map(normalizeUnitNode) : undefined,
    scope: n.scope,
    children: Array.isArray(n.children) ? n.children.map(normalizeUnitNode) : undefined,
  };
}

function normalizeJobTitleItem(j: any): JobTitleItem {
  return {
    id: j.id,
    code: j.code ?? "",
    name: j.name ?? "",
    domain: j.domain,
    monitoredUnits: j.monitoredUnits ?? j.monitored_units ?? [],
    geographicArea: j.geographicArea ?? j.geographic_area,
    category: j.category,
    rank: j.rank,
    type: j.type,
  };
}

function normalizeStaffingSlotItem(s: any): StaffingSlotItem {
  return {
    id: s.id,
    staffingId: s.staffingId ?? s.staffing_id,
    slotOrder: s.slotOrder ?? s.slot_order,
    description: s.description,
    geographicAreas: s.geographicAreas ?? s.geographic_areas ?? [],
    domains: s.domains ?? [],
    monitoredUnits: s.monitoredUnits ?? s.monitored_units ?? [],
    assignedEmployeeName: s.assignedEmployeeName ?? s.assigned_employee_name,
    assignedEmployeeCode: s.assignedEmployeeCode ?? s.assigned_employee_code,
  };
}

function normalizeStaffingReportItem(r: any): StaffingReportItem {
  return {
    id: r.id,
    unitId: r.unitId ?? r.unit_id,
    jobTitleId: r.jobTitleId ?? r.job_title_id,
    jobTitleName: r.jobTitleName ?? r.job_title_name ?? "",
    quantity: r.quantity ?? 0,
    currentCount: r.currentCount ?? r.current_count ?? 0,
    currentEmployeeNames: r.currentEmployeeNames ?? r.current_employee_names ?? [],
    jobTitleDomainName: r.jobTitleDomainName ?? r.job_title_domain_name,
    jobTitleMonitoredUnitNames: r.jobTitleMonitoredUnitNames ?? r.job_title_monitored_unit_names ?? [],
    jobTitleGeographicAreaName: r.jobTitleGeographicAreaName ?? r.job_title_geographic_area_name,
    slots: Array.isArray(r.slots) ? r.slots.map(normalizeStaffingSlotItem) : [],
  };
}

export const organizationApi = {
  getOrganizations: (q?: string): Promise<{ data: OrganizationUnitNode[] }> =>
    apiClient.get("/organizations", { params: { q: q || undefined } }).then((r: any) => ({
      data: (r.data ?? []).map(normalizeUnitNode),
    })),

  getTree: (q?: string): Promise<{ data: OrganizationUnitNode[] }> =>
    apiClient.get("/organizations/tree", { params: { q: q || undefined } }).then((r: any) => ({
      data: (r.data ?? []).map(normalizeUnitNode),
    })),


  getDetail: (identifier: string): Promise<{ data: OrganizationUnitNode }> => apiClient.get(`/organizations/detail/${encodeURIComponent(identifier)}`).then((r: any) => ({
      data: normalizeUnitNode(unwrapData<any>(r)),
    })),

  getScope: (id: number): Promise<{ data: { domains: { id: number; name: string }[], scope: string } }> =>
    apiClient.get(`/organizations/${id}/scope`).then((r: any) => ({
      data: {
        domains: r.data?.domains ?? [],
        scope: r.data?.scope,
      }
    })),

  createUnit: (payload: CreateUnitPayload) =>
    apiClient.post("/organizations", payload).then(r => unwrapData<any>(r)),

  updateUnit: (id: number, payload: UpdateUnitPayload) =>
    apiClient.put(`/organizations/${id}`, payload).then(r => unwrapData<any>(r)),

  deleteUnit: (id: number) =>
    apiClient.delete(`/organizations/${id}`).then(r => unwrapData<any>(r)),

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
      .then(r => unwrapData<any[]>(r)),

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
      .then(r => unwrapData<any[]>(r)),

  updateScope: (id: number, payload: { domainIds?: number[] }) =>
    apiClient.put(`/organizations/${id}/scope`, payload).then(r => unwrapData<any>(r)),

  getJobTitles: (unitId?: number): Promise<{ data: { partyTitles: JobTitleItem[], govTitles: JobTitleItem[], allTitles: JobTitleItem[] } }> =>
    apiClient
      .get("/organizations/job-titles", unitId != null ? { params: { unitId } } : undefined)
      .then((r: any) => {
        const data = unwrapData<any>(r);
        return {
          data: {
            partyTitles: (Array.isArray(data.partyTitles) ? data.partyTitles : []).map(normalizeJobTitleItem),
            govTitles: (Array.isArray(data.govTitles) ? data.govTitles : []).map(normalizeJobTitleItem),
            allTitles: (Array.isArray(data.allTitles) ? data.allTitles : []).map(normalizeJobTitleItem),
          }
        };
      }),

  updateJobTitle: (id: number, payload: UpdateJobTitlePayload) =>
    apiClient.put(`/organizations/job-titles/${id}`, payload).then(r => unwrapData<any>(r)),

  setStaffing: (payload: SetStaffingPayload) =>
    apiClient.post("/organizations/staffing", payload).then(r => unwrapData<any>(r)),

  getStaffingReport: (unitId: number): Promise<{ partyReport: StaffingReportItem[], govReport: StaffingReportItem[], allReport: StaffingReportItem[] }> =>
    apiClient
      .get(`/organizations/${unitId}/staffing-report`)
      .then((r: any) => {
        const data = unwrapData<any>(r);
        return {
          partyReport: Array.isArray(data.partyReport) ? data.partyReport : [],
          govReport: Array.isArray(data.govReport) ? data.govReport : [],
          allReport: Array.isArray(data.allReport) ? data.allReport : [],
        };
      }),

  setStaffingSlot: (payload: SetStaffingSlotPayload) =>
    apiClient.post("/organizations/staffing-slots", payload).then(r => unwrapData<any>(r)),

  getUnitTypes: (): Promise<{ data: any[] }> =>
    apiClient.get("/organizations/unit-types").then((r: any) => ({
      data: unwrapData<any[]>(r) || [],
    })),

  getUnitTypeJobTemplates: (unitTypeId: number): Promise<{ data: number[] }> =>
    apiClient.get(`/organizations/unit-types/${unitTypeId}/job-templates`).then((r: any) => ({
      data: r.data?.data || [],
    })),

  updateUnitTypeJobTemplates: (unitTypeId: number, jobTitleIds: number[]) =>
    apiClient.put(`/organizations/unit-types/${unitTypeId}/job-templates`, { jobTitleIds }).then((r: any) => unwrapData<any>(r)),
};

