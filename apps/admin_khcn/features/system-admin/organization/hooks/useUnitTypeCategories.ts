"use client";

import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { categoryApi } from "../../categories/api";
import { useQueryClient } from "@tanstack/react-query";
import { CATEGORY_KEYS } from "../../categories/keys";
import { toast } from "sonner";
import type { CategoryItem } from "../../categories/types";

export const UNIT_TYPE_CATEGORY_GROUP = "UNIT_TYPE_CATEGORY";

/** Parse description JSON của CategoryItem thành metadata UI */
export function parseUnitTypeCategoryMeta(item: CategoryItem): {
  icon: string;
  color: string;
  description: string;
} {
  try {
    const meta = JSON.parse(item.description ?? "{}");
    return {
      icon: meta.icon ?? "Building2",
      color: meta.color ?? "slate",
      description: meta.description ?? "",
    };
  } catch {
    return { icon: "Building2", color: "slate", description: "" };
  }
}

/**
 * Hook CRUD cho nhóm phân loại đơn vị.
 * Tuân đúng chuẩn categories: dùng categoryApi + useGetCategoryByGroup + CATEGORY_KEYS.
 */
export function useUnitTypeCategories() {
  const queryClient = useQueryClient();
  const query = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [CATEGORY_KEYS.all, "group", UNIT_TYPE_CATEGORY_GROUP],
    });

  const create = async (payload: {
    code: string;
    name: string;
    icon: string;
    color: string;
    description: string;
    order?: number;
  }) => {
    await categoryApi.create({
      group: UNIT_TYPE_CATEGORY_GROUP,
      code: payload.code,
      name: payload.name,
      order: payload.order ?? 0,
      active: 1,
      description: JSON.stringify({
        icon: payload.icon,
        color: payload.color,
        description: payload.description,
      }),
    });
    await invalidate();
    toast.success("Đã thêm nhóm phân loại.");
  };

  const update = async (id: number, payload: {
    name?: string;
    icon?: string;
    color?: string;
    description?: string;
    order?: number;
  }) => {
    const current = query.data?.find((c) => c.id === id);
    const currentMeta = current ? parseUnitTypeCategoryMeta(current) : {};
    await categoryApi.update(id, {
      name: payload.name,
      order: payload.order,
      active: 1,
      description: JSON.stringify({
        ...currentMeta,
        ...(payload.icon        ? { icon: payload.icon }               : {}),
        ...(payload.color       ? { color: payload.color }             : {}),
        ...(payload.description !== undefined ? { description: payload.description } : {}),
      }),
    });
    await invalidate();
    toast.success("Đã cập nhật nhóm phân loại.");
  };

  const remove = async (id: number) => {
    await categoryApi.delete(id);
    await invalidate();
    toast.success("Đã xóa nhóm phân loại.");
  };

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    create,
    update,
    remove,
  };
}
