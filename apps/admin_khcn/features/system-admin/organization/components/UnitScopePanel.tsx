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
  const { selectedId, flatUnits } = state;
  const { isUpdatingScope } = meta;

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
    <div className="flex flex-col gap-5 h-full">

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
      <div className="flex-1 flex flex-col gap-6 min-h-0 mt-2 max-w-2xl">
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
}: {
  items: CatalogServerItem[];   // đã được server sort: selected first
  selectedIds: number[];
  isFetching: boolean;
  q: string;
  onSearch: (v: string) => void;
  onToggle: (id: number) => void;
  onRemoveAll: () => void;
}) {
  const Icon = Briefcase;
  const placeholder = "Tìm lĩnh vực chuyên môn...";

  // Server đã sort: selected items ở đầu, rest ở sau
  const selectedItems = items.filter(i => i.selected);
  const restItems = items.filter(i => !i.selected);
  const isEmpty = items.length === 0 && !isFetching;

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
            <button
              type="button"
              onClick={onRemoveAll}
              className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              Bỏ chọn tất cả
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedItems.map(item => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
              >
                {item.name}
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
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
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )
        }
      </div>

      {/* Hint */}
      <p className="text-[11px] text-muted-foreground -mt-2">
        {isFetching
          ? "Đang tìm kiếm..."
          : isEmpty
            ? q ? `Không có kết quả cho "${q}"` : `Nhập từ khóa để tìm lĩnh vực`
            : `${items.length} kết quả${items.length >= 50 ? " — nhập thêm từ khóa để thu hẹp" : ""}`
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
          <div className="px-1 space-y-0.5">
            {/* Server đã đặt selected items trước */}
            {items.map((item, idx) => (
              <>
                {/* Divider giữa selected và rest */}
                {idx > 0 && items[idx - 1].selected && !item.selected && (
                  <div key={`sep-${item.id}`} className="py-1">
                    <Separator />
                  </div>
                )}
                <ResultRow
                  key={item.id}
                  item={item}
                  checked={item.selected}
                  onToggle={onToggle}
                />
              </>
            ))}
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
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors group",
        checked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/60",
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
    </button>
  );
}
