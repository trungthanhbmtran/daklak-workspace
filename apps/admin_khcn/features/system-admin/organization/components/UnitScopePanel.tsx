"use client";

/**
 * UnitScopePanel — Quản lý phạm vi phụ trách (lĩnh vực + địa bàn).
 *
 * Tối ưu tải:
 * - Không load toàn bộ list — tìm kiếm server-side debounce 300ms (50 items/lần)
 * - GeoAreas chỉ enabled khi user click tab Địa bàn (lazy)
 * - Selected items hiển thị ngay, không phụ thuộc vào list đang hiển thị
 * - Gọi PUT /organizations/:id/scope (endpoint chuyên biệt)
 */

import { useMemo, useState } from "react";
import { useOrganizationContext } from "../context/OrganizationContext";
import { useDomainSearch, useGeoAreaSearch } from "../hooks/useScopeCatalog";
import { Briefcase, MapPin, RotateCcw, Save, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function UnitScopePanel() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { isUpdatingScope } = meta;

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;

  // Local draft state
  const [domainIds, setDomainIds] = useState<number[]>(() => unit?.domainIds ?? []);
  const [geoIds, setGeoIds] = useState<number[]>(() => unit?.geographicAreaIds ?? []);
  const [dirty, setDirty] = useState(false);
  const [geoTabOpened, setGeoTabOpened] = useState(false);

  // Search hooks — server-side
  const domains = useDomainSearch();
  const geoAreas = useGeoAreaSearch(geoTabOpened);

  if (!unit || selectedId == null) return null;

  const handleDomainToggle = (id: number) => {
    setDomainIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setDirty(true);
  };

  const handleGeoToggle = (id: number) => {
    setGeoIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setDirty(true);
  };

  const handleReset = () => {
    setDomainIds(unit.domainIds ?? []);
    setGeoIds(unit.geographicAreaIds ?? []);
    setDirty(false);
  };

  const handleSave = async () => {
    await actions.updateScope(selectedId, { domainIds, geographicAreaIds: geoIds });
    setDirty(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">Phạm vi phụ trách</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tìm kiếm và chọn lĩnh vực, địa bàn — tải theo từ khóa
          </p>
        </div>
        {dirty && (
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">
            Chưa lưu
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="domains"
        onValueChange={(v) => { if (v === "geo") setGeoTabOpened(true); }}
      >
        <TabsList className="h-8 w-fit">
          <TabsTrigger value="domains" className="h-7 text-xs gap-1.5 px-3">
            <Briefcase className="h-3 w-3" />
            Lĩnh vực
            {domainIds.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {domainIds.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="geo" className="h-7 text-xs gap-1.5 px-3">
            <MapPin className="h-3 w-3" />
            Địa bàn
            {geoIds.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {geoIds.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Lĩnh vực */}
        <TabsContent value="domains" className="mt-3">
          <CatalogPicker
            label="lĩnh vực"
            icon={<Briefcase className="h-3.5 w-3.5" />}
            items={domains.items}
            selectedIds={domainIds}
            isFetching={domains.isFetching}
            q={domains.q}
            onSearch={domains.setQ}
            onToggle={handleDomainToggle}
            onClearAll={() => { setDomainIds([]); setDirty(true); }}
          />
        </TabsContent>

        {/* Tab: Địa bàn */}
        <TabsContent value="geo" className="mt-3">
          {!geoTabOpened ? null : (
            <CatalogPicker
              label="địa bàn"
              icon={<MapPin className="h-3.5 w-3.5" />}
              items={geoAreas.items}
              selectedIds={geoIds}
              isFetching={geoAreas.isFetching}
              q={geoAreas.q}
              onSearch={geoAreas.setQ}
              onToggle={handleGeoToggle}
              onClearAll={() => { setGeoIds([]); setDirty(true); }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Footer actions */}
      {dirty && (
        <>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Hoàn tác
            </Button>
            <Button type="button" size="sm" disabled={isUpdatingScope} onClick={handleSave}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {isUpdatingScope ? "Đang lưu..." : "Lưu phạm vi"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   CatalogPicker — inline search + checkbox list
   Không dùng modal — hiển thị trực tiếp trong tab
────────────────────────────────────────────────────────── */
function CatalogPicker({
  label, icon, items, selectedIds, isFetching, q, onSearch, onToggle, onClearAll,
}: {
  label: string;
  icon: React.ReactNode;
  items: { id: number; name: string; code?: string }[];
  selectedIds: number[];
  isFetching: boolean;
  q: string;
  onSearch: (v: string) => void;
  onToggle: (id: number) => void;
  onClearAll: () => void;
}) {
  const allVisible = useMemo(() => items, [items]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => onSearch(e.target.value)}
            placeholder={`Tìm ${label}...`}
            className="pl-8 h-9 text-sm"
          />
          {q && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {selectedIds.length > 0 && (
          <Button type="button" variant="ghost" size="sm" className="h-9 text-xs shrink-0" onClick={onClearAll}>
            Bỏ chọn tất cả
          </Button>
        )}
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
      </div>

      {/* Result hint */}
      <p className="text-xs text-muted-foreground">
        {isFetching ? "Đang tải..." : `Hiển thị ${allVisible.length} kết quả`}
        {selectedIds.length > 0 && ` · Đã chọn ${selectedIds.length}`}
        {!q && allVisible.length >= 50 && " · Nhập từ khóa để tìm thêm"}
      </p>

      {/* Checkbox list */}
      <ScrollArea className="h-64 rounded-md border">
        {allVisible.length === 0 && !isFetching ? (
          <div className="flex items-center justify-center h-full py-8 text-xs text-muted-foreground">
            {q ? `Không tìm thấy "${q}"` : `Nhập từ khóa để tìm ${label}`}
          </div>
        ) : (
          <div className="p-1">
            {allVisible.map(item => {
              const checked = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 cursor-pointer select-none transition-colors",
                    "hover:bg-muted/60",
                    checked && "bg-muted/40"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle(item.id)}
                    onClick={e => e.stopPropagation()}
                    className="h-4 w-4 shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={cn("text-sm leading-snug truncate", checked && "font-medium")}>
                      {item.name}
                    </span>
                    {item.code && (
                      <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
