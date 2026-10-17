"use client";

import { useState, useEffect } from "react";
import { Network, Save, Loader2, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StaffingSlotItem } from "../../types";
import { PopoverMultiSelect } from "../PopoverMultiSelect";
import { useGeoAreaSearch } from "../../hooks/useScopeCatalog";

type Props = {
  staffingId: number;
  slotOrder: number;
  existingSlot?: StaffingSlotItem | null;
  domainsForUnit: { id: number; name: string }[];
  unitDomainIds: number[];
  subordinateUnits: { id: number; name: string }[];
  onSave: (p: { staffingId: number; slotOrder: number; description?: string; domainIds?: number[]; geographicAreaIds?: number[]; monitoredUnitIds?: number[] }) => void;
  isSaving: boolean;
};

export function SlotCard({ staffingId, slotOrder, existingSlot, domainsForUnit, unitDomainIds, subordinateUnits, onSave, isSaving }: Props) {
  const [description, setDescription] = useState<string>(existingSlot?.description ?? "");
  const [domainIds, setDomainIds] = useState<number[]>(existingSlot?.domainIds ?? []);
  const [geoAreaIds, setGeoAreaIds] = useState<number[]>(existingSlot?.geographicAreaIds ?? []);
  const [unitIds, setUnitIds] = useState<number[]>(existingSlot?.monitoredUnitIds ?? []);

  const { items: geoAreas, isFetching: loadingGeo, q: geoQ, setQ: setGeoQ, hasNextPage, fetchNextPage, isFetchingNextPage } = useGeoAreaSearch(geoAreaIds);

  useEffect(() => {
    setDescription(existingSlot?.description ?? "");
    setDomainIds(existingSlot?.domainIds ?? []);
    setGeoAreaIds(existingSlot?.geographicAreaIds ?? []);
    setUnitIds(existingSlot?.monitoredUnitIds ?? []);
  }, [existingSlot]);

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm flex flex-col h-full min-w-0">
      <CardHeader className="py-3 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0 gap-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">{slotOrder}</div>
          <span className="truncate">Vị trí nhân sự {slotOrder}</span>
        </CardTitle>
        <Button type="button" size="sm" className="h-8 text-xs font-medium shrink-0"
          onClick={() => onSave({ staffingId, slotOrder, description: description.trim() || undefined, domainIds: domainIds.length ? domainIds : undefined, geographicAreaIds: geoAreaIds.length ? geoAreaIds : undefined, monitoredUnitIds: unitIds.length ? unitIds : undefined })}
          disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Lưu vị trí</span>
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4 text-sm">
        {existingSlot?.assignedEmployeeName ? (
          <div className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-center justify-between">
            <span className="font-semibold">Nhân sự đảm nhiệm: {existingSlot.assignedEmployeeName}</span>
            {existingSlot.assignedEmployeeCode && <span className="font-mono text-[11px] opacity-80">Mã: {existingSlot.assignedEmployeeCode}</span>}
          </div>
        ) : (
          <div className="text-xs bg-muted/50 text-muted-foreground border border-dashed px-3 py-2 rounded-lg italic">
            Chưa có nhân sự đảm nhiệm vị trí này (Còn trống biên chế).
          </div>
        )}

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên vị trí / Phân công phụ trách</label>
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Ví dụ: Vị trí 1 — Phó ban 1 (Phụ trách Tổ chức cán bộ, VTVL)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5 min-w-0">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Network className="h-3.5 w-3.5 shrink-0" /> Lĩnh vực</label>
            <PopoverMultiSelect title="Chọn lĩnh vực" icon={<Network className="h-4 w-4" />} items={domainsForUnit} selectedIds={domainIds} onChange={setDomainIds} placeholderSearch="Tìm lĩnh vực..." triggerLabel="Chọn lĩnh vực" />
          </div>
          <div className="flex flex-col space-y-1.5 min-w-0">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" /> Địa lý</label>
            <PopoverMultiSelect title="Chọn khu vực địa lý" icon={<MapPin className="h-4 w-4" />} items={geoAreas} selectedIds={geoAreaIds} onChange={setGeoAreaIds} placeholderSearch="Tìm địa bàn..." triggerLabel="Chọn địa bàn" search={geoQ} onSearchChange={setGeoQ} isLoading={loadingGeo} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} isFetchingNextPage={isFetchingNextPage} />
          </div>
          <div className="flex flex-col space-y-1.5 2xl:col-span-2 min-w-0">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5 shrink-0" /> Đơn vị trực thuộc</label>
            <PopoverMultiSelect title="Chọn đơn vị trực thuộc" icon={<Users className="h-4 w-4" />} items={subordinateUnits} selectedIds={unitIds} onChange={setUnitIds} placeholderSearch="Tìm đơn vị..." triggerLabel="Chọn đơn vị" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
