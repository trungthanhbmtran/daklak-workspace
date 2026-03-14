import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vai trò"),
  code: z.string().min(1, "Vui lòng nhập mã vai trò"),
  description: z.string().optional(),
  active: z.number(),
  permissionIds: z.array(z.number()).default([]), // Bắt buộc phải là mảng
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
