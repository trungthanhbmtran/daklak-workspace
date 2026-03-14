export interface UserItem {
  id: number;
  email: string;
  username: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  /** CCCD/CMND từ HRM – dùng tra cứu */
  cccd?: string | null;
  /** Mã số điện tử (mã cán bộ) từ HRM */
  employeeCode?: string | null;
}

/** Chi tiết user (sheet) – có thể có thêm roles, policies, lastLogin từ API */
export type UserDetail = UserItem & {
  status?: string;
  roles?: string[] | { name?: string }[];
  policies?: { description?: string; resource?: string }[];
  lastLogin?: string | number | null;
};

export interface UserCreatePayload {
  email: string;
  username?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  roleIds?: number[];
  /** CCCD từ HRM */
  cccd?: string;
  /** Mã số điện tử từ HRM */
  employeeCode?: string;
}
