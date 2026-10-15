/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/features/system-admin/organization/api";

export interface FlatUnit {
  id: number;
  name: string;
  fullPath: string;
  code: string;
  categoryCode?: string;
  typeCode?: string;
  depth: number;
}

function flattenUnits(nodes: any[], acc: FlatUnit[] = [], parentPath: string = "", depth: number = 0): FlatUnit[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} › ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({
        id: node.id,
        name: node.name,
        fullPath: currentPath,
        code: node.code,
        categoryCode: node.categoryCode,
        typeCode: node.typeCode,
        depth,
      });
    }
    flattenUnits(node.children ?? [], acc, currentPath, depth + 1);
  }
  return acc;
}

/**
 * Hook nạp và làm phẳng cây tổ chức với cơ chế Cache hiệu năng cao.
 * Tránh tính toán lại và refetch liên tục qua staleTime: 5 phút.
 */
export function useOrganizationHierarchy() {
  const { data: treeRes, isLoading, error } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    staleTime: 5 * 60 * 1000, // 5 phút không refetch
    gcTime: 10 * 60 * 1000,    // Giữ cache 10 phút
  });

  const rawTree = (treeRes as any)?.data ?? treeRes;

  const units = useMemo(() => {
    return flattenUnits(Array.isArray(rawTree) ? rawTree : []);
  }, [rawTree]);

  return {
    units,
    isLoading,
    error,
  };
}
