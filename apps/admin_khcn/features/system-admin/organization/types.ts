export interface OrganizationUnitNode {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  typeId: number;
  parentId: number | null;
  hierarchyPath?: string;
  typeName?: string;
  domainIds?: number[];
  domainNames?: string[];
  scope?: string;
  children?: OrganizationUnitNode[];
}

export interface CreateUnitPayload {
  code: string;
  name: string;
  shortName?: string;
  typeId: number;
  parentId?: number | null;
  domainIds?: number[];
  scope?: string;
}

export interface CategoryOption {
  id: number;
  group_code: string;
  code: string;
  name: string;
  order?: number;
}

/** Chức danh (dùng cho dropdown định biên), kèm lĩnh vực phụ trách, theo dõi phòng ban, khu vực địa lý */
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
}

/** Phân công riêng từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực theo slot */
export interface StaffingSlotItem {
  id: number;
  staffingId: number;
  slotOrder: number;
  description?: string;
  geographicAreaId?: number;
  geographicAreaName?: string;
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
  /** Lĩnh vực phụ trách (chức danh - mặc định chung) */
  jobTitleDomainName?: string;
  /** Theo dõi phòng ban (tên đơn vị) */
  jobTitleMonitoredUnitNames?: string[];
  /** Khu vực địa lý phụ trách */
  jobTitleGeographicAreaName?: string;
  /** Phân công từng vị trí (từng phó): mỗi slot có lĩnh vực, nhiệm vụ, khu vực riêng */
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

/** Phân công từng vị trí (từng phó): lưu lĩnh vực, nhiệm vụ, khu vực riêng cho slot */
export interface SetStaffingSlotPayload {
  staffingId: number;
  slotOrder: number;
  description?: string;
  geographicAreaId?: number;
  domainIds?: number[];
  monitoredUnitIds?: number[];
}
