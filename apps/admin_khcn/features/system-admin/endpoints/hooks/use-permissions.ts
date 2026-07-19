/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { endpointApi } from "../api";

export function usePermissions() {
  return useQuery({
    queryKey: ["roles", "permissions", "matrix"],
    queryFn: async () => {
      const res = await endpointApi.getPermissionsMatrix();
      const list = (res as any)?.data?.resources || (res as any)?.resources || [];
      const out: { id: number; label: string; group: string }[] = [];
      list.forEach((r: any) => {
        (r.permissions || []).forEach((p: any) => {
          out.push({ id: p.id, label: r.code + ":" + p.action, group: r.name });
        });
      });
      return out;
    },
    staleTime: 5 * 60_000,
  });
}
