/**
 * Query keys cho HRM – dùng với React Query.
 */
export const hrmKeys = {
  all: ["hrm"] as const,
  employees: () => [...hrmKeys.all, "employees"] as const,
  list: (params: Record<string, unknown>) => [...hrmKeys.employees(), "list", params] as const,
  search: (keyword: string) => [...hrmKeys.employees(), "search", keyword] as const,
  detail: (id: number) => [...hrmKeys.employees(), "detail", id] as const,
  departments: () => [...hrmKeys.all, "departments"] as const,
  kpis: () => [...hrmKeys.all, "kpis"] as const,
  kpiPlans: () => [...hrmKeys.all, "kpiPlans"] as const,
  kpiEvaluations: (period: string) => [...hrmKeys.all, "kpiEvaluations", period] as const,
  plans: () => [...hrmKeys.all, "plans"] as const,
  masterPlans: () => [...hrmKeys.all, "masterPlans"] as const,
  tasks: () => [...hrmKeys.all, "tasks"] as const,
  tasksList: (params: Record<string, unknown>) => [...hrmKeys.tasks(), "list", params] as const,
  taskTemplates: () => [...hrmKeys.all, "taskTemplates"] as const,
  taskTemplatesList: (rank?: string) => [...hrmKeys.taskTemplates(), "list", rank] as const,
};
