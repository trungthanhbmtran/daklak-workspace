"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationApi } from "../api";
import { organizationQueryKeys, categoryQueryKeys } from "../constants/queryKeys";
import type { CreateUnitPayload, OrganizationUnitNode } from "../types";
import type { UpdateUnitPayload } from "../api";

const STALE_TIME = 2 * 60 * 1000; // 2 phút — cây tổ chức, danh mục ít đổi
const GC_TIME = 10 * 60 * 1000; // 10 phút

function flattenTree(nodes: OrganizationUnitNode[]): OrganizationUnitNode[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  return nodes.flatMap((n) => [
    { ...n, children: undefined },
    ...flattenTree(n.children ?? []),
  ]);
}

function parseCategoryList(res: unknown): { id: number; name: string }[] {
  return Array.isArray(res) ? res : (res as { data?: { id: number; name: string }[] })?.data ?? [];
}

export function useOrganizationApi() {
  const queryClient = useQueryClient();

  const { data: tree = [], isLoading: isLoadingTree } = useQuery({
    queryKey: organizationQueryKeys.tree(),
    queryFn: () => organizationApi.getTree(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const flatUnits = flattenTree(Array.isArray(tree) ? tree : []);

  const { data: unitTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: categoryQueryKeys.unitTypes(),
    queryFn: async () =>
      parseCategoryList(await organizationApi.getUnitTypes()),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const { data: domains = [], isLoading: isLoadingDomains } = useQuery({
    queryKey: categoryQueryKeys.domains(),
    queryFn: async () =>
      parseCategoryList(await organizationApi.getDomains()),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const createUnit = useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      organizationApi.createUnit({
        ...payload,
        parentId: payload.parentId ?? undefined,
        domainIds: payload.domainIds?.length ? payload.domainIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã thêm đơn vị tổ chức.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string }; message?: string } })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể tạo đơn vị.";
      toast.error(msg);
    },
  });

  const updateUnit = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUnitPayload }) =>
      organizationApi.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã cập nhật thông tin đơn vị.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể cập nhật đơn vị.";
      toast.error(msg);
    },
  });

  const deleteUnit = useMutation({
    mutationFn: (id: number) => organizationApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã xóa đơn vị tổ chức.");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (err as Error)?.message ??
        "Không thể xóa đơn vị.";
      toast.error(msg);
    },
  });

  return {
    flatUnits,
    unitTypes,
    domains,
    isLoadingTree,
    isLoadingTypes,
    isLoadingDomains,
    createUnit: createUnit.mutateAsync,
    updateUnit: (id: number, payload: UpdateUnitPayload) =>
      updateUnit.mutateAsync({ id, payload }),
    deleteUnit: deleteUnit.mutateAsync,
    isCreating: createUnit.isPending,
    isUpdating: updateUnit.isPending,
    isDeleting: deleteUnit.isPending,
  };
}
