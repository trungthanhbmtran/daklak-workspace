"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { organizationApi } from "../api";
import { organizationQueryKeys, categoryQueryKeys } from "../constants/queryKeys";
import type { CreateUnitPayload, OrganizationUnitNode, UpdateUnitPayload } from "../types";

const STALE_TIME = 2 * 60 * 1000;   // 2 phút — cây tổ chức ít đổi
const GC_TIME = 10 * 60 * 1000;   // 10 phút
const CAT_STALE = 10 * 60 * 1000;   // danh mục rất ít đổi

function flattenTree(nodes: OrganizationUnitNode[]): OrganizationUnitNode[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  return nodes.flatMap((n) => [
    { ...n, children: undefined },
    ...flattenTree(n.children ?? []),
  ]);
}

function extractErrorMessage(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    (err as Error)?.message ??
    fallback
  );
}

/**
 * Hook quản lý toàn bộ state + actions cho trang tổ chức.
 * needCategories = true khi form tạo/sửa đơn vị đang mở (lazy load domains).
 * geoAreas được load riêng khi user chủ động click tab Địa bàn.
 */
export function useOrganizationApi(needCategories = false) {
  const queryClient = useQueryClient();
  const [needGeoAreas, setNeedGeoAreas] = useState(false);

  // Cây tổ chức — luôn fetch
  const { data: treeResponse, isLoading: isLoadingTree } = useQuery({
    queryKey: organizationQueryKeys.tree(),
    queryFn: () => organizationApi.getTree(),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const tree = treeResponse?.items ?? [];
  const flatUnits = flattenTree(tree);

  // Lĩnh vực + khu vực địa lý — lazy (chỉ cần khi form mở)
  const { data: domains = [], isLoading: isLoadingDomains } = useQuery({
    queryKey: categoryQueryKeys.domains(),
    queryFn: () => organizationApi.getDomains(),
    enabled: needCategories,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
  });

  const { data: geoAreas = [], isLoading: isLoadingGeoAreas } = useQuery({
    queryKey: categoryQueryKeys.geoAreas(),
    queryFn: () => organizationApi.getGeoAreas(),
    enabled: needCategories && needGeoAreas,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
  });

  const createUnit = useMutation({
    mutationFn: (payload: CreateUnitPayload) =>
      organizationApi.createUnit({
        ...payload,
        parentId: payload.parentId ?? undefined,
        domainIds: payload.domainIds?.length ? payload.domainIds : undefined,
        geographicAreaIds: payload.geographicAreaIds?.length ? payload.geographicAreaIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã thêm đơn vị tổ chức.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể tạo đơn vị.")),
  });

  const updateUnit = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUnitPayload }) =>
      organizationApi.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã cập nhật thông tin đơn vị.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể cập nhật đơn vị.")),
  });

  const updateScope = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { domainIds?: number[]; geographicAreaIds?: number[] } }) =>
      organizationApi.updateScope(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã cập nhật phạm vi phụ trách.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể cập nhật phạm vi.")),
  });

  const deleteUnit = useMutation({
    mutationFn: (id: number) => organizationApi.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.tree() });
      toast.success("Đã xóa đơn vị tổ chức.");
    },
    onError: (err) => toast.error(extractErrorMessage(err, "Không thể xóa đơn vị.")),
  });

  return {
    tree,
    flatUnits,
    domains,
    geoAreas,
    isLoadingTree,
    isLoadingDomains: isLoadingDomains && needCategories,
    isLoadingGeoAreas: isLoadingGeoAreas && needGeoAreas,
    loadGeoAreas: () => setNeedGeoAreas(true),
    createUnit: createUnit.mutateAsync,
    updateUnit: (id: number, payload: UpdateUnitPayload) => updateUnit.mutateAsync({ id, payload }),
    updateScope: (id: number, payload: { domainIds?: number[]; geographicAreaIds?: number[] }) =>
      updateScope.mutateAsync({ id, payload }),
    deleteUnit: deleteUnit.mutateAsync,
    isCreating: createUnit.isPending,
    isUpdating: updateUnit.isPending,
    isUpdatingScope: updateScope.isPending,
    isDeleting: deleteUnit.isPending,
  };
}
