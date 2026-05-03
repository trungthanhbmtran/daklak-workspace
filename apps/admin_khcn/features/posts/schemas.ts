// features/posts/schemas.ts

import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên chuyên mục phải có ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không được để trống"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  status: z.boolean().default(true),
  orderIndex: z.number().int().default(0),
  position: z.enum(["HEADER", "SIDEBAR", "BOTH", "FOOTER"]).default("SIDEBAR"),
  isGovStandard: z.boolean().default(false),
  thumbnail: z.string().optional(),
  linkType: z.enum(["internal", "external"]).default("internal"),
  customUrl: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string().min(5, "Tiêu đề quá ngắn"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().max(300, "Tóm tắt tối đa 300 ký tự").optional(),
  content: z.string().min(10, "Nội dung quá ngắn"),
  categoryId: z.string().min(1, "Chọn chuyên mục"),
  status: z.enum([
    "DRAFT", "SUBMITTED", "UNDER_REVIEW", "REJECTED",
    "APPROVED", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"
  ]),
  thumbnail: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNotification: z.boolean().default(false),
  
  // Decree 42 & CMS Fields
  authorName: z.string().optional(),
  source: z.string().optional(),
  language: z.string().default("vi"),
  publishedAt: z.string().optional(),
  expiredAt: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  allowComment: z.boolean().default(true),
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
