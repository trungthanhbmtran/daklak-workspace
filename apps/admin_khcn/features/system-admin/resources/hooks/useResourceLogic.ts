import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceApi } from "../api";
import { resourceKeys } from "../keys";
import type { Resource } from "../types";
import { toast } from "sonner";

const PAGE_SIZE = 12;

export function useResourceLogic() {
  const queryClient = useQueryClient();
  const { data: resources = [], isLoading: isLoadingResources, isError: isErrorResources } = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: () => resourceApi.getResources(),
    staleTime: 3 * 60 * 1000,
  });

  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [page, setPage] = useState(1);

  const filteredResources = useMemo(() => resources.filter(
    (r: Resource) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  ), [resources, searchTerm]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));
  const pagedResources = useMemo(() => {
    const safePage = page > totalPages ? 1 : page;
    return filteredResources.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredResources, page, totalPages]);

  const invalidateResources = () => queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });

  const createResourceMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: { code: string; name: string; serviceCode?: string }) => resourceApi.createResource(payload),
    onSuccess: () => invalidateResources(),
  });

  const updateResourceMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, ...payload }: { id: number; code?: string; name?: string }) =>
      resourceApi.updateResource(id, payload),
    onSuccess: () => invalidateResources(),
  });

  const deleteResourceMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (id: number) => resourceApi.deleteResource(id),
    onSuccess: (_, id) => {
      if (selectedResource?.id === id) setSelectedResource(null);
      invalidateResources();
    },
  });

  return {
    resources: pagedResources,
    allResources: resources,
    totalResources: filteredResources.length,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    isLoading: isLoadingResources,
    isError: isErrorResources,
    searchTerm,
    selectedResource,
    setSelectedResource,
    createResourceMutation,
    updateResourceMutation,
    deleteResourceMutation,
  };
}
