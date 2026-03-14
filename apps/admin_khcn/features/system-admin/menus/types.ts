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
  /** Nhiều quyền được yêu cầu để xem menu (chỉ cần có 1 trong số đó) */
  requiredPermissionIds?: number[];
}

/** Quyền từ ma trận (GET /roles/permissions/matrix) dùng cho form chọn quyền menu */
export interface Permission {
  id: number;
  module: string;
  action: string;
  code?: string;
}
