import { z } from "zod";

export const menuFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên hiển thị"),
  code: z.string().min(1, "Vui lòng nhập mã định danh"),
  path: z.string().optional(),
  icon: z.string().optional(),
  /** Mô tả hiển thị trên card Hub (sidebar không dùng) */
  description: z.string().optional(),
  /** Màu icon (hex VD: #3b82f6); để trống = màu gốc */
  iconColor: z.string().optional(),
  service: z.string().min(1, "Vui lòng chọn dịch vụ"),
  portal: z.string().min(1, "Vui lòng chọn cổng"),
  sort: z.number().min(1, "Thứ tự phải lớn hơn 0"),
  active: z.number(),
  /** Id các quyền bắt buộc để hiển thị menu (backend hiện lưu 1 quyền = phần tử đầu) */
  requiredPermissionIds: z.array(z.number()).default([]),
});

export type MenuFormValues = z.infer<typeof menuFormSchema>;
