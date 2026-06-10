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
  /**
   * Hướng A: service không còn bắt buộc trong form.
   * BFF dùng menu.code + route làm định danh thay thế.
   * Giữ lại để tương thích ngược với dữ liệu cũ trong DB.
   */
  service: z.string().optional().default(""),
  /** Luôn là ADMIN_PORTAL — auto-fill, không hiển thị trong form */
  portal: z.string().optional().default("ADMIN_PORTAL"),
  sort: z.number().min(1, "Thứ tự phải lớn hơn 0"),
  active: z.number(),
  /** Id các quyền bắt buộc để hiển thị menu */
  requiredPermissionIds: z.array(z.number()).default([]),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;
