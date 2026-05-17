import { z } from "zod";
import { MultilingualStringSchema } from "../../schemas/page.schema";

export const StatsItemSchema = z.object({
  value: z.string().default("0"),
  label: MultilingualStringSchema,
});

export const StatsGridDataSchema = z.object({
  items: z.array(StatsItemSchema).default([
    { value: "150+", label: { vi: "Đề tài nghiên cứu", en: "Research projects" } },
    { value: "45", label: { vi: "Bằng sáng chế", en: "Patents granted" } },
    { value: "1,200", label: { vi: "Doanh nghiệp hỗ trợ", en: "Supported enterprises" } },
    { value: "98%", label: { vi: "Tỷ lệ hài lòng", en: "Satisfaction rate" } }
  ]),
});

export type StatsItem = z.infer<typeof StatsItemSchema>;
export type StatsGridData = z.infer<typeof StatsGridDataSchema>;
