import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { organizationApi } from "../api";
import { organizationQueryKeys } from "../constants/queryKeys";

const STALE_TIME = 2 * 60 * 1000;
const GC_TIME    = 10 * 60 * 1000;

export function useOrganizationTreeQuery(q?: string) {
  return useQuery({
    queryKey: [...organizationQueryKeys.tree(), { q }],
    queryFn: () => organizationApi.getTree(q),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useOrganizationFlatListQuery(q?: string) {
  return useQuery({
    queryKey: [...organizationQueryKeys.lists(), { q }],
    queryFn: () => organizationApi.getOrganizations(q),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useOrganizationDetailQuery(id?: number) {
  return useQuery({
    queryKey: id ? organizationQueryKeys.unit(id) : [...organizationQueryKeys.all, "unit"],
    queryFn: () => (id ? organizationApi.getOne(id) : Promise.reject("No id")),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

