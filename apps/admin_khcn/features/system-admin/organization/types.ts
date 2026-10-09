/** Một node trong cây tổ chức */
export interface OrganizationUnitNode {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  /** Tag phân loại: CHINH_QUYEN | DANG | THAM_MUU | CHUYEN_MON | SU_NGHIEP | PHONG_THUOC_SN */
  categoryCode?: string;
  typeId?: number;
  parentId: number | null;
  hierarchyPath?: string;
  domains?: { id: number; name: string }[];
  domainIds?: number[];
  subordinateUnits?: OrganizationUnitNode[];
  scope?: string;
  children?: OrganizationUnitNode[];
}

/** Payload tạo mới đơn vị */
export interface CreateUnitPayload {
  code: string;
  name: string;
  shortName?: string;
  categoryCode?: string;
  typeId: number;
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
  typeId?: number;
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



export interface UpdateJobTitlePayload {
  domainId?: number;
  geographicAreaId?: number;
  monitoredUnitIds?: number[];
}

