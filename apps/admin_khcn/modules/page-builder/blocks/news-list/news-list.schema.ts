import { z } from "zod";

export const NewsListDataSchema = z.object({
  categoryId: z.number().nullable().optional(),
  limit: z.number().min(1).max(20).default(6),
  selectedCategoryName: z.string().optional(),
});

export type NewsListData = z.infer<typeof NewsListDataSchema>;
