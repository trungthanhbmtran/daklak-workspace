"use client";

/**
 * useScopeCatalog — Hook tối ưu cho UnitScopePanel.
 *
 * Server-side logic:
 * 1. selectedIds luôn được fetch và đặt đầu danh sách (server merge & sort)
 * 2. Search debounce 300ms — giới hạn 50 items/lần
 * 3. Server trả về field `selected: boolean` — client chỉ hiển thị
 * 4. GeoAreas lazy khi user click tab
 */

import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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

/** Hook lĩnh vực — server-side search + selected-first sort */
export function useDomainSearch(selectedIds: number[]) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const query = useInfiniteQuery<CatalogServerItem[]>({
    queryKey: ["categories", "DOMAIN", debouncedQ, selectedIds.join(",")],
    queryFn: ({ pageParam = 0 }) => organizationApi.getDomains(debouncedQ, selectedIds, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      // 15 items per page
      return lastPage.length === 15 ? allPages.length * 15 : undefined;
    },
    initialPageParam: 0,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
  });

  const items = query.data?.pages.flat() || [];

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
      return lastPage.length === 15 ? allPages.length * 15 : undefined;
    },
    initialPageParam: 0,
    enabled,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
  });

  const items = query.data?.pages.flat() || [];

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
