import { z } from "zod";

// Multilingual string map schema
export const MultilingualStringSchema = z.record(z.string(), z.string());

// Block/Widget style overrides schema
export const BlockSettingsSchema = z.object({
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
  paddingLeft: z.string().optional(),
  paddingRight: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  customClass: z.string().optional(),
}).optional();

// Individual widget instance validation
export const WidgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: MultilingualStringSchema,
  content: z.record(z.string(), z.string()).optional(),
  data: z.any().optional(), // Dynamic data evaluated at run-time per block type
  settings: BlockSettingsSchema,
});

// Column validation schema
export const ColumnSchema = z.object({
  id: z.string(),
  colSpan: z.string(),
  widgets: z.array(WidgetSchema),
});

// Section settings validation schema
export const SectionSettingsSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundImage: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
  textColor: z.string().optional(),
  fullWidth: z.boolean().optional(),
  gap: z.string().optional(),
  borderRadius: z.string().optional(),
  borderWidth: z.string().optional(),
  borderColor: z.string().optional(),
}).optional();

// Row/Section validation schema
export const RowSchema = z.object({
  rowId: z.string(),
  columns: z.array(ColumnSchema),
  settings: SectionSettingsSchema,
});

// Total Page configuration layout schema
export const PageLayoutSchema = z.array(RowSchema);

// Custom page meta validation schema
export const CustomPageMetaSchema = z.object({
  id: z.string(),
  title: MultilingualStringSchema,
  isActive: z.boolean(),
  seo: z.object({
    metaTitle: MultilingualStringSchema.optional(),
    metaDescription: MultilingualStringSchema.optional(),
    metaKeywords: MultilingualStringSchema.optional(),
    ogImage: z.string().optional(),
  }).optional(),
});

export const CustomPageListSchema = z.array(CustomPageMetaSchema);
export type ZWidget = z.infer<typeof WidgetSchema>;
export type ZColumn = z.infer<typeof ColumnSchema>;
export type ZRow = z.infer<typeof RowSchema>;
export type ZSectionSettings = z.infer<typeof SectionSettingsSchema>;
export type ZPageMeta = z.infer<typeof CustomPageMetaSchema>;
