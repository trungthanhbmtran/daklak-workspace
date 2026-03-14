export interface Role {
    id: number;
    code: string;
    name: string;
    description: string;
    active: number;
    permissionIds: number[]; // Mảng chứa ID các quyền được cấp
  }
  
  export interface Permission {
    id: number;
    module: string; // Tên nhóm (VD: Quản lý người dùng, Quản lý văn bản)
    action: string; // Tên quyền (VD: Xem, Thêm, Sửa, Xóa)
    code: string;   // Mã quyền (VD: USER_VIEW, USER_CREATE)
  }
