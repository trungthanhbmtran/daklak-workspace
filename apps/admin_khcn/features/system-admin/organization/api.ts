import apiClient from "@/lib/axiosInstance";
import type {
  OrganizationUnitNode,
  CreateUnitPayload,
  JobTitleItem,
  StaffingReportItem,
  StaffingSlotItem,
  SetStaffingPayload,
  SetStaffingSlotPayload,
  UpdateJobTitlePayload,
} from "./types";

function normalizeUnitNode(n: any): OrganizationUnitNode {
  const rawParentId = n.parentId ?? n.parent_id ?? null;
  return {
    id: n.id,
    code: n.code ?? "",
    name: n.name ?? "",
    shortName: n.shortName ?? n.short_name,
    typeId: n.typeId ?? n.type_id,
    parentId: rawParentId === 0 ? null : rawParentId,
    hierarchyPath: n.hierarchyPath ?? n.hierarchy_path,
    typeName: n.typeName ?? n.type_name,
    domainIds: n.domainIds ?? n.domain_ids ?? [],
    domainNames: n.domainNames ?? n.domain_names ?? [],
    scope: n.scope,
    children: Array.isArray(n.children) ? n.children.map(normalizeUnitNode) : undefined,
  };
}

export interface UpdateUnitPayload {
  code?: string;
  name?: string;
  shortName?: string;
  typeId?: number;
  parentId?: number | null;
  domainIds?: number[];
  scope?: string;
}

function unwrapData<T>(res: any): T {
  // Axios interceptor returns response.data which is { success, data, meta }
  return (res?.data ?? res) as T;
}

export const organizationApi = {
  getTree: (): Promise<OrganizationUnitNode[]> =>
    apiClient
      .get("/organizations/tree")
      .then((r: any) => {
        const list = Array.isArray(unwrapData<any[]>(r)) ? unwrapData<any[]>(r) : [];
        return list.map(normalizeUnitNode);
      }),

  getOne: (id: number) =>
    apiClient.get(`/organizations/${id}`).then(r => unwrapData<any>(r)),

  createUnit: (payload: CreateUnitPayload) =>
    apiClient.post("/organizations", payload).then(r => unwrapData<any>(r)),

  updateUnit: (id: number, payload: UpdateUnitPayload) =>
    apiClient.put(`/organizations/${id}`, payload).then(r => unwrapData<any>(r)),

  deleteUnit: (id: number) =>
    apiClient.delete(`/organizations/${id}`).then(r => unwrapData<any>(r)),

  getUnitTypes: () =>
    apiClient.get("/organizations/unit-types").then(r => unwrapData<any[]>(r)),

  getDomains: () =>
    apiClient.get("/categories", { params: { group: "DOMAIN" } }).then(r => unwrapData<any[]>(r)),

  /** Danh sách chức danh (unitId: chỉ chức danh áp dụng cho loại đơn vị đó, VD Sở không có Chủ tịch) */
  getJobTitles: (unitId?: number): Promise<{ items: JobTitleItem[] }> =>
    apiClient
      .get("/organizations/job-titles", unitId != null ? { params: { unitId } } : undefined)
      .then((r: any) => {
        const data = unwrapData<any[]>(r);
        return {
          items: (Array.isArray(data) ? data : []).map(normalizeJobTitleItem),
        };
      }),

  /** Cập nhật chức danh: lĩnh vực phụ trách, theo dõi phòng ban, khu vực địa lý */
  updateJobTitle: (id: number, payload: UpdateJobTitlePayload) =>
    apiClient.put(`/organizations/job-titles/${id}`, payload).then(r => unwrapData<any>(r)),

  getGeoAreas: () =>
    apiClient.get("/categories", { params: { group: "GEO_AREA" } }).then(r => unwrapData<any[]>(r)),

  /** Thiết lập định biên: đơn vị + chức danh + số lượng */
  setStaffing: (payload: SetStaffingPayload) =>
    apiClient.post("/organizations/staffing", payload).then(r => unwrapData<any>(r)),

  /** Báo cáo định biên của đơn vị (chức danh + số lượng + hiện có + slots từng vị trí) */
  getStaffingReport: (unitId: number): Promise<StaffingReportItem[]> =>
    apiClient
      .get(`/organizations/${unitId}/staffing-report`)
      .then((r: any) => {
        const data = unwrapData<any[]>(r);
        return (Array.isArray(data) ? data : []).map(normalizeStaffingReportItem);
      }),

  /** Phân công từng vị trí (từng phó): lưu lĩnh vực, nhiệm vụ, khu vực riêng cho slot */
  setStaffingSlot: (payload: SetStaffingSlotPayload) =>
    apiClient.post("/organizations/staffing-slots", payload).then(r => unwrapData<any>(r)),
};

function normalizeJobTitleItem(j: any): JobTitleItem {
  return {
    id: j.id,
    code: j.code ?? "",
    name: j.name ?? "",
    domainId: j.domainId ?? j.domain_id,
    domainName: j.domainName ?? j.domain_name,
    monitoredUnitIds: j.monitoredUnitIds ?? j.monitored_unit_ids ?? [],
    monitoredUnitNames: j.monitoredUnitNames ?? j.monitored_unit_names ?? [],
    geographicAreaId: j.geographicAreaId ?? j.geographic_area_id,
    geographicAreaName: j.geographicAreaName ?? j.geographic_area_name,
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
    geographicAreaId: s.geographicAreaId ?? s.geographic_area_id,
    geographicAreaName: s.geographicAreaName ?? s.geographic_area_name,
    geographicAreaIds: s.geographicAreaIds ?? s.geographic_area_ids ?? [],
    geographicAreaNames: s.geographicAreaNames ?? s.geographic_area_names ?? [],
    domainIds: s.domainIds ?? s.domain_ids ?? [],
    domainNames: s.domainNames ?? s.domain_names ?? [],
    monitoredUnitIds: s.monitoredUnitIds ?? s.monitored_unit_ids ?? [],
    monitoredUnitNames: s.monitoredUnitNames ?? s.monitored_unit_names ?? [],
  };
}

function normalizeStaffingReportItem(r: any): StaffingReportItem {
  const slotsRaw = r.slots ?? [];
  return {
    id: r.id,
    unitId: r.unitId ?? r.unit_id,
    jobTitleId: r.jobTitleId ?? r.job_title_id,
    jobTitleName: r.jobTitleName ?? r.job_title_name ?? "",
    quantity: r.quantity ?? 0,
    currentCount: r.currentCount ?? r.current_count ?? 0,
    jobTitleDomainName: r.jobTitleDomainName ?? r.job_title_domain_name,
    jobTitleMonitoredUnitNames:
      r.jobTitleMonitoredUnitNames ?? r.job_title_monitored_unit_names ?? [],
    jobTitleGeographicAreaName:
      r.jobTitleGeographicAreaName ?? r.job_title_geographic_area_name,
    slots: Array.isArray(slotsRaw) ? slotsRaw.map(normalizeStaffingSlotItem) : [],
  };
}
