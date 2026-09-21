"use client";

/**
 * UnitScopePanel — Pham vi phu trach (linh vuc chuyen mon).
 * Rebuilt from scratch. No return null. Correct TQ v5 loading states.
 */

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useInfiniteQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase, RotateCcw, Save, Search, X,
  Loader2, CheckCircle2, Circle, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { organizationApi } from "../api";
import { organizationQueryKeys } from "../constants/queryKeys";

const SCOPE_STALE = 2 * 60 * 1000;
const CAT_STALE   = 10 * 60 * 1000;
const GC_TIME     = 15 * 60 * 1000;
const DEBOUNCE_MS = 300;
const PAGE_SIZE   = 15;

function useDebounce(value: string, delay = DEBOUNCE_MS) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function UnitScopePanel() {
  const params = useParams<{ code: string }>();
  const code = params?.code ? decodeURIComponent(params.code) : "";

  const detailQuery = useQuery({
    queryKey: code ? [...organizationQueryKeys.all, "detail", code] : [...organizationQueryKeys.all, "detail"],
    queryFn: () => organizationApi.getDetail(code),
    enabled: !!code,
    staleTime: SCOPE_STALE,
  });

  const unit = detailQuery.data?.data;
  const unitId = unit?.id;
  const parentId = unit?.parentId ?? undefined;

  const scopeQuery = useQuery({
    queryKey: unitId ? [...organizationQueryKeys.unit(unitId), "scope"] : [...organizationQueryKeys.all, "scope"],
    queryFn: () => organizationApi.getScope(unitId!),
    enabled: unitId != null,
    staleTime: SCOPE_STALE,
  });

  const [selectedDomainIds, setSelectedDomainIds] = useState<number[]>([]);
  const [dirty, setDirty] = useState(false);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q);

  useEffect(() => {
    if (scopeQuery.data?.data !== undefined) {
      setSelectedDomainIds(scopeQuery.data.data.domainIds ?? []);
      setDirty(false);
    }
  }, [scopeQuery.data]);

  const domainsQuery = useInfiniteQuery<{ id: number; name: string; code?: string; selected: boolean }[]>({
    queryKey: ["categories", "DOMAIN", debouncedQ, selectedDomainIds.join(","), parentId],
    queryFn: ({ pageParam = 0 }) =>
      organizationApi.getDomains(debouncedQ, selectedDomainIds, pageParam as number, parentId),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    initialPageParam: 0,
    staleTime: CAT_STALE,
    gcTime: GC_TIME,
    placeholderData: keepPreviousData,
    enabled: unitId != null,
  });

  const domainItems = domainsQuery.data?.pages.flat() ?? [];
  const displayItems = domainItems.map(item => ({ ...item, selected: selectedDomainIds.includes(item.id) }));

  const queryClient = useQueryClient();
  const updateScopeMutation = useMutation({
    mutationFn: (payload: { domainIds: number[] }) => organizationApi.updateScope(unitId!, payload),
    onSuccess: () => {
      if (unitId != null) queryClient.invalidateQueries({ queryKey: [...organizationQueryKeys.unit(unitId), "scope"] });
      queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      toast.success("Da luu pham vi phu trach.");
      setDirty(false);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? (err as Error)?.message ?? "Khong the luu.";
      toast.error(msg);
    },
  });

  const handleToggle = useCallback((id: number) => {
    setSelectedDomainIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setDirty(true);
  }, []);

  const handleRemoveAll = useCallback(() => { setSelectedDomainIds([]); setDirty(true); }, []);
  const handleReset = useCallback(() => { setSelectedDomainIds(scopeQuery.data?.data?.domainIds ?? []); setDirty(false); }, [scopeQuery.data]);
  const handleSave = useCallback(async () => { await updateScopeMutation.mutateAsync({ domainIds: selectedDomainIds }); }, [updateScopeMutation, selectedDomainIds]);

  const isDetailLoading = (detailQuery.isPending || detailQuery.isFetching) && !unit;
  if (isDetailLoading) return <PanelSkeleton />;
  if (detailQuery.isError || (code && !isDetailLoading && !unit)) return <PanelError message="Khong tai duoc thong tin don vi. Vui long thu lai." />;
  const isScopeLoading = scopeQuery.isPending && !scopeQuery.data;
  if (isScopeLoading) return <PanelSkeleton />;

  const selectedItems = displayItems.filter(i => i.selected);
  const isEmpty = displayItems.length === 0 && !domainsQuery.isFetching;

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Phạm vi phụ trách</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Lĩnh vực chuyên môn được giao quản lý</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && <span className="inline-flex items-center text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">Chưa lưu</span>}
          {dirty && <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset} iconStart={<RotateCcw className="h-3.5 w-3.5" />}>Hoàn tác</Button>}
          <Button size="sm" className="h-8 text-xs" disabled={!dirty || updateScopeMutation.isPending} onClick={handleSave}>
            {updateScopeMutation.isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Đang lưu...</> : <><Save className="h-3.5 w-3.5 mr-1" />Lưu thay đổi</>}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex-1 flex flex-col min-h-0 bg-muted/20 border rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"><Briefcase className="h-4 w-4" /></div>
          <h4 className="text-sm font-semibold">Lĩnh vực chuyên môn</h4>
          {selectedDomainIds.length > 0 && <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">{selectedDomainIds.length}</span>}
        </div>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />Đã chọn ({selectedItems.length})</span>
                <Button type="button" variant="ghost" size="sm" className="text-[11px] h-7 px-2 text-muted-foreground hover:text-destructive" onClick={handleRemoveAll}>Bỏ chọn tất cả</Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedItems.map(item => (
                  <span key={item.id} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    {item.name}
                    <button type="button" onClick={() => handleToggle(item.id)} className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
              <Separator />
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm lĩnh vực chuyên môn..." className="pl-9 pr-9 h-9 text-sm bg-muted/30 border-muted focus-visible:bg-background" />
            {domainsQuery.isFetching
              ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              : q && <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
            }
          </div>

          <p className="text-[11px] text-muted-foreground -mt-2">
            {domainsQuery.isFetching ? "Đang tìm kiếm..." : isEmpty ? (q ? `Không có kết quả cho "${q}"` : "Nhập từ khóa để tìm lĩnh vực") : `${displayItems.length} kết quả${displayItems.length >= PAGE_SIZE ? " — nhập thêm để thu hẹp" : ""}`}
          </p>

          <ScrollArea className="flex-1 min-h-[240px] -mx-1">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Briefcase className="h-8 w-8 opacity-25" />
                <p className="text-sm">{q ? `Không tìm thấy "${q}"` : "Nhập từ khóa để tìm lĩnh vực"}</p>
              </div>
            ) : (
              <div className="px-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pb-4">
                {displayItems.map(item => <DomainRow key={item.id} item={item} onToggle={handleToggle} />)}
              </div>
            )}
            {domainsQuery.hasNextPage && (
              <div className="pt-2 flex justify-center pb-6">
                <Button type="button" variant="outline" size="sm" className="text-primary hover:text-primary hover:bg-primary/5 border-primary/20" onClick={() => domainsQuery.fetchNextPage()} disabled={domainsQuery.isFetchingNextPage}>
                  {domainsQuery.isFetchingNextPage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang tải...</> : "Tải thêm lĩnh vực"}
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function DomainRow({ item, onToggle }: { item: { id: number; name: string; code?: string; selected: boolean }; onToggle: (id: number) => void }) {
  return (
    <button type="button" onClick={() => onToggle(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group border", item.selected ? "bg-primary/5 hover:bg-primary/10 border-primary/20" : "bg-background hover:bg-muted/60 border-transparent")}>
      {item.selected ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />}
      <div className="flex-1 min-w-0">
        <span className={cn("text-sm leading-snug truncate block", item.selected ? "font-medium text-primary" : "text-foreground")}>{item.name}</span>
        {item.code && <span className="text-[11px] font-mono text-muted-foreground">{item.code}</span>}
      </div>
    </button>
  );
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 h-full border rounded-xl">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}

function PanelError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 py-16 flex flex-col items-center gap-3 text-center">
      <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
