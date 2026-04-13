// features/posts/schemas.ts

import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên chuyên mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không được để trống"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  status: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
});

export const bannerSchema = z.object({
  name: z.string().min(2, "Tên banner phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không được để trống"),
  description: z.string().optional(),
  imageUrl: z.string().min(1, "Vui lòng tải ảnh lên"),
  linkType: z.enum(["internal", "external"]).default("internal"),
  customUrl: z.string().optional(),
  target: z.string().default("_self"),
  position: z.enum(["top", "middle", "bottom", "custom"]).default("top"),
  orderIndex: z.number().int().default(0),
  status: z.boolean().default(true),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.linkType === "external" && (!data.customUrl || data.customUrl.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vui lòng nhập đường dẫn liên kết ngoài (URL)",
      path: ["customUrl"],
    });
  }
});
