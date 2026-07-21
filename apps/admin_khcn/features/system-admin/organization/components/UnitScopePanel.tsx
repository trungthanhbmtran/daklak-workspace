"use client";

/**
 * UnitScopePanel — Phạm vi phụ trách (lĩnh vực + địa bàn).
 *
 * Server thực hiện:
 *  - Sort: selected items luôn ở đầu danh sách
 *  - Đánh dấu `selected: boolean` trên từng item
 *  - Filter theo q (search debounce 300ms)
 * Client chỉ hiển thị và gửi lại PUT /:id/scope khi lưu.
 */

import { useState } from "react";
import { useOrganizationContext } from "../context/OrganizationContext";
import { useParams } from "next/navigation";
import { useDomainSearch, type CatalogServerItem } from "../hooks/useScopeCatalog";
import {
  Briefcase, RotateCcw, Save, Search, X,
  Loader2, CheckCircle2, Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ─── Main panel ──────────────────────────────────────── */
export function UnitScopePanel() {
  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits } = state;
  const { isUpdatingScope } = meta;
  const params = useParams<{ id: string }>();
  const selectedId = params?.id ? Number(params.id) : null;

  const unit = selectedId != null ? flatUnits.find(u => u.id === selectedId) : null;

  // Local IDs — server sẽ dùng để sort & đánh dấu selected
  const [domainIds, setDomainIds] = useState<number[]>(() => unit?.domainIds ?? []);
  const [dirty, setDirty] = useState(false);

  // Truyền selectedIds lên server để server sort + đánh dấu
  const domains = useDomainSearch(domainIds);

  if (!unit || selectedId == null) return null;

  const toggle = (ids: number[], id: number) =>
    ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

  const handleDomainToggle = (id: number) => { setDomainIds(p => toggle(p, id)); setDirty(true); };

  const handleReset = () => {
    setDomainIds(unit.domainIds ?? []);
    setDirty(false);
  };

  const handleSave = async () => {
    // Chỉ lưu domainIds theo yêu cầu mới
    await actions.updateScope(selectedId, { domainIds });
    setDirty(false);
  };

  return (
    <div className="flex flex-col gap-5 flex-1 min-h-0">

      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Phạm vi phụ trách</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Lĩnh vực chuyên môn được giao quản lý
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <span className="inline-flex items-center text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
              Chưa lưu
            </span>
          )}
          {dirty && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Hoàn tác
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs"
            disabled={!dirty || isUpdatingScope}
            onClick={handleSave}
          >
            {isUpdatingScope
              ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Đang lưu...</>
              : <><Save className="h-3.5 w-3.5 mr-1" />Lưu thay đổi</>}
          </Button>
        </div>
      </div>

      <Separator />

      {/* ─── 1-Column Layout ─── */}
      <div className="flex-1 flex flex-col min-h-0 mt-2">
        {/* Lĩnh vực phụ trách */}
        <div className="flex-1 flex flex-col min-h-0 bg-muted/20 border rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold">Lĩnh vực chuyên môn</h4>
            {domainIds.length > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {domainIds.length}
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ScopePicker
              items={domains.items}
              selectedIds={domainIds}
              isFetching={domains.isFetching}
              q={domains.q}
              onSearch={domains.setQ}
              onToggle={handleDomainToggle}
              onRemoveAll={() => { setDomainIds([]); setDirty(true); }}
              hasNextPage={domains.hasNextPage}
              fetchNextPage={domains.fetchNextPage}
              isFetchingNextPage={domains.isFetchingNextPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ScopePicker ─────────────────────────────────────── */
function ScopePicker({
  items, selectedIds, isFetching, q, onSearch, onToggle, onRemoveAll,
  hasNextPage, fetchNextPage, isFetchingNextPage
}: {
  items: CatalogServerItem[];   // đã được server sort: selected first
  selectedIds: number[];
  isFetching: boolean;
  q: string;
  onSearch: (v: string) => void;
  onToggle: (id: number) => void;
  onRemoveAll: () => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}) {
  const Icon = Briefcase;
  const placeholder = "Tìm lĩnh vực chuyên môn...";

  // Override selected state with local state for instant feedback
  const displayItems = items.map(item => ({
    ...item,
    selected: selectedIds.includes(item.id)
  }));

  const selectedItems = displayItems.filter(i => i.selected);
  // eslint-disable-next-line unused-imports/no-unused-vars
  const restItems = displayItems.filter(i => !i.selected);
  const isEmpty = displayItems.length === 0 && !isFetching;

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Chips: selected items */}
      {selectedItems.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              Đã chọn ({selectedItems.length})
            </span>
            <Button
              type="button"
              onClick={onRemoveAll}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              Bỏ chọn tất cả
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map(item => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
              >
                {item.name}
                <Button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </span>
            ))}
          </div>
          <Separator />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={q}
          onChange={e => onSearch(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9 h-9 text-sm bg-muted/30 border-muted focus-visible:bg-background"
        />
        {isFetching
          ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          : q && (
            <Button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          )
        }
      </div>

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground -mt-2">
        {isFetching
          ? "Đang tìm kiếm..."
          : isEmpty
            ? q ? `Không có kết quả cho "${q}"` : `Nhập từ khóa để tìm lĩnh vực`
            : `${displayItems.length} kết quả${displayItems.length >= 50 ? " — nhập thêm từ khóa để thu hẹp" : ""}`
        }
      </p>

      {/* Result list — server đã sort sẵn */}
      <ScrollArea className="flex-1 min-h-[240px] -mx-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Icon className="h-8 w-8 opacity-25" />
            <p className="text-sm">{q ? `Không tìm thấy "${q}"` : `Nhập từ khóa để tìm lĩnh vực`}</p>
          </div>
        ) : (
          <div className="px-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 pb-4">
            {displayItems.map((item) => (
              <ResultRow
                key={item.id}
                item={item}
                checked={item.selected}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
        {hasNextPage && fetchNextPage && (
          <div className="pt-2 flex justify-center pb-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/5 border-primary/20"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Đang tải...</>
              ) : (
                "Tải thêm lĩnh vực"
              )}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/* ─── ResultRow ───────────────────────────────────────── */
function ResultRow({
  item, checked, onToggle,
}: {
  item: CatalogServerItem;
  checked: boolean;
  onToggle: (id: number) => void;
}) {
  return (
    <Button
      type="button"
      onClick={() => onToggle(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group border",
        checked ? "bg-primary/5 hover:bg-primary/10 border-primary/20" : "bg-background hover:bg-muted/60 border-transparent",
      )}
    >
      {checked
        ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
        : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
      }
      <div className="flex-1 min-w-0">
        <span className={cn(
          "text-sm leading-snug truncate block",
          checked ? "font-medium text-primary" : "text-foreground",
        )}>
          {item.name}
        </span>
        {item.code && (
          <span className="text-[11px] font-mono text-muted-foreground">{item.code}</span>
        )}
      </div>
    </Button>
  );
}
