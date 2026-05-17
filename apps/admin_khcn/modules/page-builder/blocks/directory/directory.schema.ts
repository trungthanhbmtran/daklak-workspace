import { z } from "zod";

export const DirectoryUnitSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable().optional(),
  parentId: z.number().nullable().optional(),
});

export const DirectoryDataSchema = z.object({
  selectedUnitIds: z.array(z.number()).default([]),
  selectedUnits: z.array(DirectoryUnitSchema).default([]),
  displayStyle: z.enum(["tree", "grid", "list"]).default("tree"),
});

export type DirectoryData = z.infer<typeof DirectoryDataSchema>;
export type DirectoryUnit = z.infer<typeof DirectoryUnitSchema>;
