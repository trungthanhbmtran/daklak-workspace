import { z } from "zod";

/** Schema thêm/sửa đơn vị — validation tiếng Việt */
export const organizationUnitSchema = z.object({
  code: z
    .string()
    .min(1, "Mã đơn vị không được để trống")
    .max(50, "Mã đơn vị tối đa 50 ký tự"),
  name: z
    .string()
    .min(1, "Tên đơn vị không được để trống")
    .max(255, "Tên đơn vị tối đa 255 ký tự"),
  shortName: z.string().max(50, "Tên viết tắt tối đa 50 ký tự").optional(),
  typeId: z.number({ error: "Vui lòng chọn loại đơn vị" }),
  domainIds: z.array(z.number()).optional(),
  scope: z.string().max(500, "Phạm vi quản lý tối đa 500 ký tự").optional(),
});

export type OrganizationUnitFormValues = z.infer<typeof organizationUnitSchema>;
