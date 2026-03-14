import apiClient from "@/lib/axiosInstance";
import type { Resource, Permission, ResourceWithPermissions } from "./types";

/** GET /roles/permissions/matrix — gateway trả về { data: { resources } } hoặc { resources } */
function parseMatrixResponse(res: unknown): ResourceWithPermissions[] {
  const body = res as { data?: { resources?: unknown[] }; resources?: unknown[] };
  const raw = body?.data?.resources ?? body?.resources ?? [];
  const list = Array.isArray(raw) ? raw : [];
  return list.map((r: unknown) => {
    const row = r as Record<string, unknown>;
    const perms = (row.permissions ?? []) as Array<Record<string, unknown>>;
    return {
      id: Number(row.id),
      code: String(row.code ?? ""),
      name: String(row.name ?? ""),
      permissions: perms.map((p) => ({
        id: Number(p.id),
        resource_id: Number(p.resourceId ?? p.resource_id ?? 0),
        action: String(p.action ?? ""),
      })),
    };
  });
}

/** Ma trận từ API → danh sách Resource (không kèm permissions) */
export function matrixToResources(matrix: ResourceWithPermissions[]): Resource[] {
  return matrix.map((r) => ({ id: r.id, code: r.code, name: r.name }));
}

/** Ma trận từ API → danh sách Permission phẳng (tất cả resource) */
export function matrixToPermissions(matrix: ResourceWithPermissions[]): Permission[] {
  return matrix.flatMap((r) =>
    r.permissions.map((p) => ({ ...p, resource_id: r.id }))
  );
}

export const resourceApi = {
  getMatrix: async (): Promise<ResourceWithPermissions[]> => {
    const res = await apiClient.get("/roles/permissions/matrix");
    return parseMatrixResponse(res);
  },

  createResource: (payload: { code: string; name: string }) =>
    apiClient.post<{ id: number; code: string; name: string }>("/resources", payload),

  updateResource: (id: number, payload: { code?: string; name?: string }) =>
    apiClient.put<{ id: number; code: string; name: string }>(`/resources/${id}`, payload),

  deleteResource: (id: number) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/resources/${id}`),

  createPermission: (resourceId: number, action: string) =>
    apiClient.post<{ id: number; action: string; resource_id: number }>(`/resources/${resourceId}/permissions`, { action }),

  deletePermission: (id: number) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/resources/permissions/${id}`),
};
