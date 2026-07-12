/**
 * React Query key factories cho Organization feature.
 * Tập trung tại đây để invalidateQueries nhất quán.
 */
export const organizationQueryKeys = {
  all: ["organization"] as const,
  tree: () => [...organizationQueryKeys.all, "tree"] as const,
  lists: () => [...organizationQueryKeys.all, "lists"] as const,
  unit: (id: number) => [...organizationQueryKeys.all, "unit", id] as const,
  staffingReport: (unitId: number) => [...organizationQueryKeys.all, "staffing-report", unitId] as const,
  jobTitles: (unitId?: number) => [...organizationQueryKeys.all, "job-titles", unitId] as const,
};

export const categoryQueryKeys = {
  all: ["categories"] as const,
  group: (group: string) => [...categoryQueryKeys.all, group] as const,
  domains: () => categoryQueryKeys.group("DOMAIN"),
  geoAreas: () => categoryQueryKeys.group("GEO_AREA"),
};
