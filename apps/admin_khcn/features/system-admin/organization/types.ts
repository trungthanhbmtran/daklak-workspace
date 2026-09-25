/** Một node trong cây tổ chức */
export interface OrganizationUnitNode {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  /** Tag phân loại: CHINH_QUYEN | DANG | THAM_MUU | CHUYEN_MON | SU_NGHIEP | PHONG_THUOC_SN */
  categoryCode?: string;
  parentId: number | null;
  hierarchyPath?: string;
  domains?: { id: number; name: string }[];
  subordinateUnits?: OrganizationUnitNode[];
  scope?: string;
  children?: OrganizationUnitNode[];
}

/** Payload tạo mới đơn vị */
export interface CreateUnitPayload {
  code: string;
  name: string;
  shortName?: string;
  categoryCode: string;
  parentId?: number | null;
  domainIds?: number[];
  scope?: string;
}

/** Payload cập nhật đơn vị (mọi field optional) */
export interface UpdateUnitPayload {
  code?: string;
  name?: string;
  shortName?: string;
  categoryCode?: string;
  parentId?: number | null;
  domainIds?: number[];
  scope?: string;
}

/** Chức danh kèm lĩnh vực phụ trách, phòng ban theo dõi, khu vực địa lý */
export interface JobTitleItem {
  id: number;
  code: string;
  name: string;
  domain?: { id: number; name: string };
  monitoredUnits?: { id: number; name: string }[];
  geographicArea?: { id: number; name: string };
  category?: string;
  rank?: number;
  type?: string;
}

/** Phân công riêng từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực theo slot */
export interface StaffingSlotItem {
  id: number;
  staffingId: number;
  slotOrder: number;
  description?: string;
  geographicAreas?: { id: number; name: string }[];
  domains?: { id: number; name: string }[];
  monitoredUnits?: { id: number; name: string }[];
  assignedEmployeeName?: string;
  assignedEmployeeCode?: string;
}

/** Một dòng báo cáo định biên của đơn vị */
export interface StaffingReportItem {
  id: number;
  unitId: number;
  jobTitleId: number;
  jobTitleName: string;
  quantity: number;
  currentCount: number;
  currentEmployeeNames?: string[];
  jobTitleDomainName?: string;
  jobTitleMonitoredUnitNames?: string[];
  jobTitleGeographicAreaName?: string;
  slots?: StaffingSlotItem[];
  assignedUserBySlot?: Record<number, { fullName: string; employeeCode: string | null }>;
}

export interface UpdateJobTitlePayload {
  domainId?: number;
  geographicAreaId?: number;
  monitoredUnitIds?: number[];
}

export interface SetStaffingPayload {
  unitId: number;
  jobTitleId: number;
  quantity: number;
}

export interface SetStaffingSlotPayload {
  staffingId: number;
  slotOrder: number;
  description?: string;
  geographicAreaIds?: number[];
  domainIds?: number[];
  monitoredUnitIds?: number[];
}
