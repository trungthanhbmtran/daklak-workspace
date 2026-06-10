import { z } from "zod";

const policySchema = z.object({
  resourceCode: z.string().min(1),
  action: z.string().min(1),
  effect: z.enum(['ALLOW', 'DENY']),
  conditions: z.object({
    expression: z.string().optional()
  }).optional(),
});

export const roleFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vai trò"),
  code: z.string().min(1, "Vui lòng nhập mã vai trò"),
  description: z.string().optional(),
  active: z.number(),
  policies: z.array(policySchema).default([]),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
