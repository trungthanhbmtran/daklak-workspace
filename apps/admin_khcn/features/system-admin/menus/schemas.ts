import { z } from "zod";

export const menuFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên hiển thị"),
  code: z.string().min(1, "Vui lòng nhập mã định danh"),
  path: z.string().optional(),
  icon: z.string().optional(),
  /** Mô tả hiển thị trên card Hub (node gốc); để trống = không dùng */
  description: z.string().optional(),
  /** Màu icon (hex VD: #3b82f6); để trống = màu gốc */
  iconColor: z.string().optional(),
  /** Hướng A: không cần chọn — auto-fill hoặc bỏ qua */
  service: z.string().optional().default(""),
  /** Luôn là ADMIN_PORTAL — auto-fill */
  portal: z.string().optional().default("ADMIN_PORTAL"),
  sort: z.number().min(1, "Thứ tự phải lớn hơn 0"),
  active: z.number(),
  /**
   * PBAC chuẩn: resource.code để kiểm soát hiển thị menu.
   * Để trống = menu công khai (hiển thị với tất cả user đã đăng nhập).
   * Thay thế requiredPermissionIds.
   */
  linkedResourceCode: z.string().nullable().optional(),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;
