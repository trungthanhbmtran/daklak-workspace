import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { unwrapData } from "@/lib/api-helper";
import { organizationApi } from "../api";
import { organizationQueryKeys } from "../constants/queryKeys";

const STALE_TIME = 2 * 60 * 1000;
const GC_TIME    = 10 * 60 * 1000;

export function useOrganizationTreeQuery(q?: string) {
  return useQuery<any[]>({
    queryKey: [...organizationQueryKeys.tree(), { q }],
    queryFn: () => organizationApi.getTree(q),
    select: (res: any) => unwrapData<any[]>(res, []),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useOrganizationFlatListQuery(q?: string, options?: { enabled?: boolean }) {
  return useQuery<any[]>({
    queryKey: [...organizationQueryKeys.lists(), { q }],
    queryFn: () => organizationApi.getOrganizations(q),
    select: (res: any) => unwrapData<any[]>(res, []),
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useOrganizationDetailQuery(identifier?: string) {
  return useQuery<any>({
    queryKey: identifier ? [...organizationQueryKeys.all, "detail", identifier] : [...organizationQueryKeys.all, "detail"],
    queryFn: () => (identifier ? organizationApi.getDetail(identifier) : Promise.reject("No identifier")),
    select: (res: any) => unwrapData<any>(res, {}),
    enabled: !!identifier,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useOrganizationScopeQuery(id?: number) {
  return useQuery<any>({
    queryKey: id ? [...organizationQueryKeys.unit(id), "scope"] : [...organizationQueryKeys.all, "scope"],
    queryFn: () => (id ? organizationApi.getScope(id) : Promise.reject("No id")),
    select: (res: any) => unwrapData<any>(res, null),
    enabled: !!id,
    staleTime: STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useUnitTypesQuery() {
  return useQuery<any[]>({
    queryKey: [...organizationQueryKeys.all, "unit-types"],
    queryFn: () => organizationApi.getUnitTypes(),
    select: (res: any) => unwrapData<any[]>(res, []),
    staleTime: STALE_TIME,
  });
}
