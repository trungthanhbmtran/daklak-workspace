"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Network, Users, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StaffingSlotItem } from "../../types";

type SlotCardProps = {
  staffingId: number;
  slotOrder: number;
  existingSlot: StaffingSlotItem | null | undefined;
  domainsForUnit: { id: number; name: string }[];
  geoAreas: { id: number; name: string }[];
  subordinateUnits: { id: number; name: string; code?: string }[];
  onSave: (payload: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    geographicAreaIds?: number[];
    domainIds?: number[];
    monitoredUnitIds?: number[];
  }) => void;
  isSaving: boolean;
};

export function SlotCard({
  staffingId,
  slotOrder,
  existingSlot,
  domainsForUnit,
  geoAreas,
  subordinateUnits,
  onSave,
  isSaving,
}: SlotCardProps) {
  const [description, setDescription] = useState(existingSlot?.description ?? "");
  const [domainIds, setDomainIds] = useState<number[]>(existingSlot?.domainIds ?? []);

  // Khởi tạo geographicAreaIds từ dữ liệu hiện có
  // Ưu tiên mảng mới (geographicAreaIds), fallback về ID đơn cũ
  const initGeoIds = (): number[] => {
    if (existingSlot?.geographicAreaIds && existingSlot.geographicAreaIds.length > 0) {
      return existingSlot.geographicAreaIds;
    }
    if (existingSlot?.geographicAreaId && existingSlot.geographicAreaId > 0) {
      return [existingSlot.geographicAreaId];
    }
    return [];
  };

  const [geographicAreaIds, setGeographicAreaIds] = useState<number[]>(initGeoIds);
  const [monitoredUnitIds, setMonitoredUnitIds] = useState<number[]>(
    existingSlot?.monitoredUnitIds ?? []
  );

  useEffect(() => {
    setDescription(existingSlot?.description ?? "");
    setDomainIds(existingSlot?.domainIds ?? []);
    setGeographicAreaIds(
      existingSlot?.geographicAreaIds && existingSlot.geographicAreaIds.length > 0
        ? existingSlot.geographicAreaIds
        : existingSlot?.geographicAreaId && existingSlot.geographicAreaId > 0
          ? [existingSlot.geographicAreaId]
          : []
    );
    setMonitoredUnitIds(existingSlot?.monitoredUnitIds ?? []);
  }, [
    existingSlot?.id,
    existingSlot?.description,
    existingSlot?.domainIds,
    existingSlot?.geographicAreaIds,
    existingSlot?.geographicAreaId,
    existingSlot?.monitoredUnitIds,
  ]);

  const toggleDomain = (id: number) => {
    setDomainIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleGeoArea = (id: number) => {
    setGeographicAreaIds((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleUnit = (id: number) => {
    setMonitoredUnitIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave({
      staffingId,
      slotOrder,
      description: description.trim() || undefined,
      geographicAreaIds: geographicAreaIds.length ? geographicAreaIds : undefined,
      domainIds: domainIds.length ? domainIds : undefined,
      monitoredUnitIds: monitoredUnitIds.length ? monitoredUnitIds : undefined,
    });
  };

  return (
    <Card className="rounded-xl border bg-background shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/20 transition-all">
      {/* HEADER */}
      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Users className="h-4 w-4" /> Vị trí thứ {slotOrder}
        </CardTitle>
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs px-3 bg-primary/90 hover:bg-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
          ) : (
            <Save className="h-3 w-3 mr-1.5" />
          )}
          {isSaving ? "Đang lưu..." : "Lưu phân công"}
        </Button>
      </CardHeader>

      {/* CONTENT: Grid 2 cột Desktop, 1 cột Mobile */}
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">

        {/* CỘT TRÁI: Nhiệm vụ + Khu vực địa lý (multi-select) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Nhiệm vụ được giao
            </label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-colors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả công việc, nhiệm vụ cụ thể..."
            />
          </div>

          {/* Khu vực địa lý — MULTI-SELECT checkboxes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Khu vực địa lý phụ trách
              {geographicAreaIds.length > 0 && (
                <span className="ml-auto text-[11px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {geographicAreaIds.length} đã chọn
                </span>
              )}
            </label>
            <ScrollArea className="h-[100px] rounded-md border bg-muted/10 p-2 shadow-inner">
              <div className="flex flex-col gap-0.5">
                {geoAreas.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic p-1">Chưa có khu vực địa lý.</span>
                ) : (
                  geoAreas.map((g) => (
                    <label
                      key={g.id}
                      className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={geographicAreaIds.includes(g.id)}
                        onCheckedChange={() => toggleGeoArea(g.id)}
                      />
                      <span className="text-sm leading-none">{g.name}</span>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* CỘT PHẢI: Lĩnh vực + Đơn vị trực thuộc (multi-select) */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Network className="h-3.5 w-3.5 text-muted-foreground" /> Lĩnh vực phụ trách
            </label>
            <ScrollArea className="h-[100px] rounded-md border bg-muted/10 p-2 shadow-inner">
              <div className="flex flex-col gap-0.5">
                {domainsForUnit.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic p-1">Chưa có lĩnh vực được giao.</span>
                ) : (
                  domainsForUnit.map((d) => (
                    <label
                      key={d.id}
                      className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={domainIds.includes(d.id)}
                        onCheckedChange={() => toggleDomain(d.id)}
                      />
                      <span className="text-sm leading-none">{d.name}</span>
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" /> Theo dõi đơn vị trực thuộc
            </label>
            <ScrollArea className="h-[100px] rounded-md border bg-muted/10 p-2 shadow-inner">
              <div className="flex flex-col gap-0.5">
                {subordinateUnits.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic p-1">Chưa có đơn vị trực thuộc.</span>
                ) : (
                  subordinateUnits.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={monitoredUnitIds.includes(u.id)}
                        onCheckedChange={() => toggleUnit(u.id)}
                      />
                      <span className="truncate text-sm leading-none">{u.name}</span>
                      {u.code && (
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider shrink-0">({u.code})</span>
                      )}
                    </label>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
