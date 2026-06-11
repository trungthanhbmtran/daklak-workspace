"use client";

/**
 * useScopeCatalog — Hook tối ưu cho UnitScopePanel.
 *
 * Thay vì load toàn bộ list domains/geoAreas, hook này:
 * 1. Fetch theo từ khóa search (debounce 300ms) — giới hạn 50 items/lần
 * 2. Fetch riêng các selected items theo IDs để hiển thị đúng tên dù không có trong trang hiện tại
 * 3. GeoAreas chỉ được enable khi user click tab (lazy)
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "../api";

const CAT_STALE = 10 * 60 * 1000;
const GC_TIME   = 15 * 60 * 1000;
const DEBOUNCE_MS = 300;

function useDebounce(value: string, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Hook riêng cho lĩnh vực — search server-side */
export function useDomainSearch() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const { data: items = [], isFetching } = useQuery({
    queryKey: ["categories", "DOMAIN", debouncedQ],
    queryFn: () => organizationApi.getDomains(debouncedQ),
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: (prev) => prev, // giữ kết quả cũ trong khi fetch mới
  });

  return { items, isFetching, q, setQ };
}

/** Hook riêng cho địa bàn — lazy + search server-side */
export function useGeoAreaSearch(enabled: boolean) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  const { data: items = [], isFetching } = useQuery({
    queryKey: ["categories", "GEO_AREA", debouncedQ],
    queryFn: () => organizationApi.getGeoAreas(debouncedQ),
    enabled,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: (prev) => prev,
  });

  return { items, isFetching, q, setQ };
}
