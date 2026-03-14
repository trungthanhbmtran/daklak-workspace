import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi, matrixToResources, matrixToPermissions } from "../api";
import { resourceKeys } from "../keys";
import type { Resource, Permission, ResourceWithPermissions } from "../types";

export function useResourceLogic() {
  const queryClient = useQueryClient();
  const { data: matrix = [], isLoading, isError } = useQuery({
    queryKey: resourceKeys.matrix(),
    queryFn: () => resourceApi.getMatrix(),
  });

  const resources = matrixToResources(matrix);
  const permissions = matrixToPermissions(matrix);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const invalidateMatrix = () => queryClient.invalidateQueries({ queryKey: resourceKeys.matrix() });

  const createResourceMutation = useMutation({
    mutationFn: (payload: { code: string; name: string }) => resourceApi.createResource(payload),
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

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentPermissions = selectedResource
    ? permissions.filter((p) => p.resource_id === selectedResource.id)
    : [];

  return {
    resources: filteredResources,
    allResources: resources,
    permissions,
    matrix: matrix as ResourceWithPermissions[],
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
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
