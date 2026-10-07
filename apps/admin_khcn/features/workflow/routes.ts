/** Route chuẩn của phân hệ Quy trình — dùng chung để tránh hard-code chuỗi đường dẫn. */
export const WORKFLOW_ROUTES = {
  hub: "/services/workflow",
  list: "/services/workflow/workflows",
  bindings: "/services/workflow/workflows/bindings",
  create: "/services/workflow/workflows/new",
  edit: (id: string) => `/services/workflow/workflows/${encodeURIComponent(id)}/edit`,
  instances: "/services/workflow/instances",
} as const;
