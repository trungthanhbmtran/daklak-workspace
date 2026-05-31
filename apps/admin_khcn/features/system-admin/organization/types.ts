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
  geographicAreaIds?: number[];
  geographicAreaNames?: string[];
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
  geographicAreaIds?: number[];
}

export interface CategoryOption {
  id: number;
  group_code: string;
  code: string;
  name: string;
  order?: number;
}
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
  geographicAreaIds?: number[];
  geographicAreaNames?: string[];
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
  geographicAreaIds?: number[];
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
  type?: string;
}

/** Phân công riêng từng vị trí (từng phó): lĩnh vực, nhiệm vụ, khu vực theo slot */
export interface StaffingSlotItem {
  id: number;
  staffingId: number;
  slotOrder: number;
  description?: string;
  geographicAreaId?: number;       // deprecated
  geographicAreaName?: string;     // deprecated
  geographicAreaIds?: number[];    // mới: nhiều khu vực
  geographicAreaNames?: string[];  // mới
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
  /** Danh sách tên người đang giữ vị trí */
  currentEmployeeNames?: string[];
  /** Lĩnh vực phụ trách (chức danh - mặc định chung) */
  jobTitleDomainName?: string;
  /** Khu vực địa lý phụ trách */
  jobTitleMonitoredUnitNames?: string[];
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
  geographicAreaIds?: number[];  // nhiều khu vực địa lý
  domainIds?: number[];
  monitoredUnitIds?: number[];
}
