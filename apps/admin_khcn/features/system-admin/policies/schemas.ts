import { z } from "zod";

const policySchema = z.object({
  resourceId: z.number().optional(),
  resourceCode: z.string().min(1),
  action: z.string().min(1),
  effect: z.enum(['ALLOW', 'DENY']),
  conditions: z.object({
    expression: z.string().optional()
  }).optional(),
});

export const policyFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vai trò"),
  code: z.string().min(1, "Vui lòng nhập mã vai trò"),
  description: z.string().optional(),
  active: z.number(),
  policies: z.array(policySchema).default([]),
});

export type PolicyFormValues = z.infer<typeof policyFormSchema>;
