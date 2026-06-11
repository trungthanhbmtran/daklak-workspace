"use client";

/**
 * UnitScopePanel — Chức năng phụ trợ: Quản lý phạm vi phụ trách của đơn vị.
 *
 * Tách biệt với thông tin cơ bản (tên, mã, phân loại) — gọi endpoint riêng
 * PUT /organizations/:id/scope để cập nhật domainIds + geographicAreaIds.
 *
 * Chỉ load geoAreas khi user click tab Địa bàn (lazy).
 */

import { useMemo, useState } from "react";
import { useOrganizationContext } from "../context/OrganizationContext";
import { Briefcase, MapPin, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelectModal } from "./MultiSelectModal";

export function UnitScopePanel() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const {
    domains, geoAreas,
    isLoadingDomains, isLoadingGeoAreas,
    loadGeoAreas, isUpdatingScope,
  } = meta;

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  // Local state — draft trước khi lưu
  const [domainIds, setDomainIds] = useState<number[]>(() => unit?.domainIds ?? []);
  const [geoIds, setGeoIds] = useState<number[]>(() => unit?.geographicAreaIds ?? []);
  const [dirty, setDirty] = useState(false);

  const domainsToOffer = useMemo(() => {
    if (parentUnit?.domainIds?.length && domains.length) {
      return domains.filter((d) => parentUnit.domainIds!.includes(d.id));
    }
    return domains;
  }, [parentUnit, domains]);

  const selectedDomainNames = useMemo(
    () => domains.filter((d) => domainIds.includes(d.id)).map((d) => d.name),
    [domainIds, domains],
  );

  const selectedGeoNames = useMemo(
    () => geoAreas.filter((g) => geoIds.includes(g.id)).map((g) => g.name),
    [geoIds, geoAreas],
  );

  if (!unit || selectedId == null) return null;

  const handleDomainChange = (ids: number[]) => { setDomainIds(ids); setDirty(true); };
  const handleGeoChange   = (ids: number[]) => { setGeoIds(ids); setDirty(true); };
  const handleReset = () => { setDomainIds(unit.domainIds ?? []); setGeoIds(unit.geographicAreaIds ?? []); setDirty(false); };

  const handleSave = async () => {
    await actions.updateScope(selectedId, { domainIds, geographicAreaIds: geoIds });
    setDirty(false);
  };

  return (
    <div className="space-y-4">
      {/* Info bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium leading-none">Phạm vi phụ trách</p>
          <p className="text-xs text-muted-foreground mt-1">
            {parentUnit?.domainIds?.length
              ? `Giới hạn trong lĩnh vực của: ${parentUnit.name}`
              : "Lĩnh vực chuyên môn và địa bàn được giao quản lý"}
          </p>
        </div>
        {dirty && (
          <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">
            Chưa lưu
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="domains" onValueChange={(v) => { if (v === "geo") loadGeoAreas(); }}>
        <TabsList className="h-8 w-fit">
          <TabsTrigger value="domains" className="h-7 text-xs gap-1.5 px-3">
            <Briefcase className="h-3 w-3" />
            Lĩnh vực
            {selectedDomainNames.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {selectedDomainNames.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="geo" className="h-7 text-xs gap-1.5 px-3">
            <MapPin className="h-3 w-3" />
            Địa bàn
            {selectedGeoNames.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                {selectedGeoNames.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Lĩnh vực chuyên môn
          </p>
          <MultiSelectModal
            title="Chọn lĩnh vực chuyên môn"
            icon={<Briefcase className="h-5 w-5" />}
            items={domainsToOffer}
            selectedIds={domainIds}
            onChange={handleDomainChange}
            placeholderSearch="Tìm lĩnh vực..."
            triggerLabel="Chọn lĩnh vực"
            isLoading={isLoadingDomains}
          />
          {selectedDomainNames.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedDomainNames.slice(0, 5).map((n) => (
                <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
              ))}
              {selectedDomainNames.length > 5 && (
                <Badge variant="outline" className="text-xs">+{selectedDomainNames.length - 5}</Badge>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="geo" className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Địa bàn phụ trách
          </p>
          <MultiSelectModal
            title="Chọn phạm vi địa lý"
            icon={<MapPin className="h-5 w-5" />}
            items={geoAreas}
            selectedIds={geoIds}
            onChange={handleGeoChange}
            placeholderSearch="Tìm tỉnh thành, khu vực..."
            triggerLabel="Chọn địa bàn"
            isLoading={isLoadingGeoAreas}
            onOpenChange={(open) => { if (open) loadGeoAreas(); }}
          />
          {selectedGeoNames.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedGeoNames.slice(0, 5).map((n) => (
                <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
              ))}
              {selectedGeoNames.length > 5 && (
                <Badge variant="outline" className="text-xs">+{selectedGeoNames.length - 5}</Badge>
              )}
            </div>
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
