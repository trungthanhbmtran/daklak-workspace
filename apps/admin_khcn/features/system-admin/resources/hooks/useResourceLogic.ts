import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi, matrixToResources, matrixToPermissions } from "../api";
import { resourceKeys } from "../keys";
import type { Resource, Permission, ResourceWithPermissions } from "../types";

const PAGE_SIZE = 12;

export function useResourceLogic() {
  const queryClient = useQueryClient();
  const { data: matrix = [], isLoading: isLoadingMatrix, isError: isErrorMatrix } = useQuery({
    queryKey: resourceKeys.matrix(),
    queryFn: () => resourceApi.getMatrix(),
    staleTime: 3 * 60 * 1000,
  });

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [page, setPage] = useState(1);

  const resources = useMemo(() => matrixToResources(matrix), [matrix]);
  const permissions = useMemo(() => matrixToPermissions(matrix), [matrix]);

  // commonActions — lazy: chỉ fetch khi đang chọn resource (cần thêm action)
  const { data: commonActions = [] } = useQuery({
    queryKey: ["resource-action-categories"],
    queryFn: () => resourceApi.getActionCategories(),
    enabled: !!selectedResource,
    staleTime: 10 * 60 * 1000,
  });

  const filteredResources = useMemo(() => resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [resources, searchTerm]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));
  const pagedResources = useMemo(() => {
    const safePage = page > totalPages ? 1 : page;
    return filteredResources.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredResources, page, totalPages]);

  const invalidateMatrix = () => queryClient.invalidateQueries({ queryKey: resourceKeys.matrix() });

  const createResourceMutation = useMutation({
    mutationFn: (payload: { code: string; name: string; serviceCode?: string }) => resourceApi.createResource(payload),
    onSuccess: () => invalidateMatrix(),
  });

  const updateResourceMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: number; code?: string; name?: string }) =>
      resourceApi.updateResource(id, payload),
    onSuccess: () => invalidateMatrix(),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: number) => resourceApi.deleteResource(id),
    onSuccess: (_, id) => {
      if (selectedResource?.id === id) setSelectedResource(null);
      invalidateMatrix();
    },
  });

  const createPermissionMutation = useMutation({
    mutationFn: ({ resourceId, action }: { resourceId: number; action: string }) =>
      resourceApi.createPermission(resourceId, action),
    onSuccess: () => invalidateMatrix(),
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id: number) => resourceApi.deletePermission(id),
    onSuccess: () => invalidateMatrix(),
  });

  const currentPermissions = selectedResource
    ? permissions.filter((p) => p.resource_id === selectedResource.id)
    : [];

  return {
    resources: pagedResources,
    allResources: resources,
    totalResources: filteredResources.length,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    permissions,
    matrix: matrix as ResourceWithPermissions[],
    commonActions,
    isLoading: isLoadingMatrix,
    isError: isErrorMatrix,
    searchTerm,
    selectedResource,
    setSelectedResource,
    currentPermissions,
    createResourceMutation,
    updateResourceMutation,
    deleteResourceMutation,
    createPermissionMutation,
    deletePermissionMutation,
  };
}
