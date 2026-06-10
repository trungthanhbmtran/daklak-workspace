export interface MenuItem {
  id: number;
  code: string;
  name: string;
  path: string;
  icon: string;
  parentId: number | null;
  service: string;
  portal: string;
  target: string;
  sort: number;
  active: number;
  /** Mô tả hiển thị trên card Hub (để trống = không dùng) */
  description?: string | null;
  /** Màu icon hex (VD: #3b82f6); để trống = màu gốc */
  iconColor?: string | null;
  /**
   * PBAC chuẩn: resource.code để kiểm soát hiển thị menu.
   * Thay thế requiredPermissionIds — menu visible nếu user có BẤT KỲ policy nào trên resource này.
   */
  linkedResourceCode?: string | null;
  /** @deprecated Dùng linkedResourceCode thay thế. Giữ lại để backward compat. */
  requiredPermissionIds?: number[];
}

/**
 * PBAC Resource — dùng cho dropdown chọn resource trong menu form
 * Lấy từ GET /admin/resources
 */
export interface PbacResource {
  id: number;
  code: string;
  name: string;
  serviceCode?: string | null;
}
