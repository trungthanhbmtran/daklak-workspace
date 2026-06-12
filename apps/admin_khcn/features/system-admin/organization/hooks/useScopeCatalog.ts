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
import { useQuery } from "@tanstack/react-query";
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

  const { data: items = [], isFetching } = useQuery<CatalogServerItem[]>({
    queryKey: ["categories", "DOMAIN", debouncedQ, selectedIds.join(",")],
    queryFn: () => organizationApi.getDomains(debouncedQ, selectedIds),
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: prev => prev,
  });

  return { items, isFetching, q, setQ };
}

/** Hook địa bàn — lazy + server-side search + selected-first sort */
export function useGeoAreaSearch(selectedIds: number[], enabled: boolean) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const { data: items = [], isFetching } = useQuery<CatalogServerItem[]>({
    queryKey: ["categories", "GEO_AREA", debouncedQ, selectedIds.join(",")],
    queryFn: () => organizationApi.getGeoAreas(debouncedQ, selectedIds),
    enabled,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: prev => prev,
  });

  return { items, isFetching, q, setQ };
}
