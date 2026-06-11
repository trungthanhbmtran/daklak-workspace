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
  domainIds?: number[];
  domainNames?: string[];
  scope?: string;
  geographicAreaIds?: number[];
  geographicAreaNames?: string[];
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
  geographicAreaIds?: number[];
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
  geographicAreaIds?: number[];
}

/** Chức danh kèm lĩnh vực phụ trách, phòng ban theo dõi, khu vực địa lý */
export interface JobTitleItem {
  id: number;
  code: string;
  name: string;
  domainId?: number;
  domainName?: string;
  monitoredUnitIds?: number[];
  monitoredUnitNames?: string[];
  geographicAreaId?: number;
  geographicAreaName?: string;
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
  geographicAreaIds?: number[];
  geographicAreaNames?: string[];
  domainIds?: number[];
  domainNames?: string[];
  monitoredUnitIds?: number[];
  monitoredUnitNames?: string[];
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
