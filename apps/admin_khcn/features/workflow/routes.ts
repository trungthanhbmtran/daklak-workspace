/** Route chuẩn của phân hệ Quy trình — dùng chung để tránh hard-code chuỗi đường dẫn. */
export const WORKFLOW_ROUTES = {
  hub: "/services/integration",
  list: "/services/integration/workflows",
  create: "/services/integration/workflows/new",
  detail: (id: string) => `/services/integration/workflows/${encodeURIComponent(id)}`,
  edit: (id: string) => `/services/integration/workflows/${encodeURIComponent(id)}/edit`,
  instances: "/services/integration/instances",
} as const;
