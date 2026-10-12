"use client";

/**
 * useScopeCatalog — Hook tối ưu cho UnitScopePanel.
 *
 * Server-side logic:
 * 1. selectedIds luôn được fetch và đặt đầu danh sách (server merge & sort)
 * 2. Search debounce 300ms — giới hạn 50 items/lần
 * 3. Server trả về field `selected: boolean` — client chỉ hiển thị
 * 4. GeoAreas lazy khi user click tab
 * 5. Khử trùng lặp (deduplication) triệt để bằng Set<number> theo item.id giữa các trang
 */

import { useState, useEffect } from "react";
import { useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { organizationApi } from "../api";

const CAT_STALE  = 10 * 60 * 1000;
const GC_TIME    = 15 * 60 * 1000;
const DEBOUNCE_MS = 300;

export interface CatalogServerItem {
  id: number;
  name: string;
  code?: string;
  selected: boolean;
}

function useDebounce(value: string, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Hook lĩnh vực — server-side search + selected-first sort + deduplicate an toàn */
export function useDomainSearch(selectedIds: number[], parentUnitId?: number) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const query = useInfiniteQuery<CatalogServerItem[]>({
    queryKey: ["categories", "DOMAIN", debouncedQ, selectedIds.join(","), parentUnitId],
    queryFn: ({ pageParam = 0 }) => organizationApi.getDomains(debouncedQ, selectedIds, pageParam as number, parentUnitId),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return allPages.reduce((acc, p) => acc + (p?.length || 0), 0);
    },
    initialPageParam: 0,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  });

  // Khử trùng lặp giữa các trang bằng Set<number>
  const rawItems = query.data?.pages.flat() || [];
  const seen = new Set<number>();
  const items: CatalogServerItem[] = [];
  for (const item of rawItems) {
    if (item && typeof item.id === "number" && !seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
  }

  return { 
    items, 
    isFetching: query.isFetching, 
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    q, 
    setQ 
  };
}

export function useGeoAreaSearch(selectedIds: number[], enabled = true) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const query = useInfiniteQuery<CatalogServerItem[]>({
    queryKey: ["categories", "GEO_AREA", debouncedQ, selectedIds.join(",")],
    queryFn: ({ pageParam = 0 }) => organizationApi.getGeographicAreas(debouncedQ, selectedIds, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return allPages.reduce((acc, p) => acc + (p?.length || 0), 0);
    },
    initialPageParam: 0,
    enabled,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
  });

  // Khử trùng lặp giữa các trang bằng Set<number>
  const rawItems = query.data?.pages.flat() || [];
  const seen = new Set<number>();
  const items: CatalogServerItem[] = [];
  for (const item of rawItems) {
    if (item && typeof item.id === "number" && !seen.has(item.id)) {
      seen.add(item.id);
      items.push(item);
    }
  }

  return { 
    items, 
    isFetching: query.isFetching, 
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    q, 
    setQ 
  };
}
