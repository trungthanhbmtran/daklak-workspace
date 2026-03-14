/**
 * Factory Pattern cho React Query keys - Organization feature.
 * Dùng cho invalidateQueries, queryKey nhất quán.
 */
export const organizationQueryKeys = {
  all: ["organization"] as const,
  tree: () => [...organizationQueryKeys.all, "tree"] as const,
  unit: (id: number) => [...organizationQueryKeys.all, "unit", id] as const,
  staffingReport: (unitId: number) =>
    [...organizationQueryKeys.all, "staffing-report", unitId] as const,
  jobTitles: (unitId?: number) =>
    [...organizationQueryKeys.all, "job-titles", unitId] as const,
};

export const categoryQueryKeys = {
  all: ["categories"] as const,
  group: (group: string) => [...categoryQueryKeys.all, group] as const,
  unitTypes: () => categoryQueryKeys.group("UNIT_TYPE"),
  domains: () => categoryQueryKeys.group("DOMAIN"),
  geoAreas: () => categoryQueryKeys.group("GEO_AREA"),
};
