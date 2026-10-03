import { z } from "zod";

export const integrationFormSchema = z.object({
  name: z.string().min(1, { message: "Vui lòng nhập Tên hệ thống đối tác" }),
  code: z.string().min(1, { message: "Vui lòng nhập Mã tích hợp" }).regex(/^[A-Z0-9_]+$/, { message: "Mã tích hợp chỉ chứa chữ in hoa, số và dấu gạch dưới" }),
  version: z.string().optional(),
  isActive: z.boolean(),
  protocol: z.string().min(1, { message: "Vui lòng chọn giao thức" }),
  baseUrl: z.string().optional(),
  authType: z.string().min(1, { message: "Vui lòng chọn loại xác thực" }),
  authUrl: z.string().optional(),
  apiToken: z.string().optional(),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  scope: z.string().optional(),
  tokenPath: z.string().optional(),
  isRawMode: z.boolean(),
  rawConfig: z.string(),
  // Missing properties from protobuf payload
  timeoutMs: z.number().min(0).optional(),
  cacheTtlSec: z.number().min(0).optional(),
  retry: z.string().optional(), // Expected to be JSON
  rateLimit: z.string().optional(), // Expected to be JSON
  roles: z.string().optional(), // Comma-separated string
  scopes: z.string().optional(), // Comma-separated string
}).refine((data) => {
  if (data.isRawMode) {
    try {
      JSON.parse(data.rawConfig);
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
}, {
  message: "Cấu hình JSON không hợp lệ",
  path: ["rawConfig"]
});

export type IntegrationFormValues = z.infer<typeof integrationFormSchema>;
