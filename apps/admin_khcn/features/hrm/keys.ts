/**
 * Query keys cho HRM – dùng với React Query.
 */
export const hrmKeys = {
  all: ["hrm"] as const,
  employees: () => [...hrmKeys.all, "employees"] as const,
  list: (params: Record<string, unknown>) => [...hrmKeys.employees(), "list", params] as const,
  search: (keyword: string) => [...hrmKeys.employees(), "search", keyword] as const,
  detail: (id: number) => [...hrmKeys.employees(), "detail", id] as const,
};
