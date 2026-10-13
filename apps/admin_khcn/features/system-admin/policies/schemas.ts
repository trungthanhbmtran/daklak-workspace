import { z } from "zod";

const policySchema = z.object({
  resourceId: z.number().optional(),
  resourceCode: z.string().optional(),
  action: z.string().min(1),
  effect: z.enum(['ALLOW', 'DENY']).default('ALLOW'),
  conditions: z.object({
    expression: z.string().optional()
  }).optional(),
});

export const policyFormSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên vai trò"),
  code: z.string().optional(),
  description: z.string().optional(),
  active: z.number().default(1),
  policies: z.array(policySchema).default([]),
});

export type PolicyFormValues = z.infer<typeof policyFormSchema>;
