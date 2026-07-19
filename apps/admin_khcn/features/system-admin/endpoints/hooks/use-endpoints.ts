/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { endpointApi } from "../api";

export function useEndpoints() {
  return useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const res = await endpointApi.getEndpoints();
      return (res as any)?.data?.endpoints || (res as any)?.endpoints || [];
    },
    staleTime: 5 * 60_000,
  });
}

export function useAssignEndpointPermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ endpointId, permissionId }: { endpointId: number; permissionId: number }) =>
      endpointApi.assignPermission(endpointId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
    },
  });
}
