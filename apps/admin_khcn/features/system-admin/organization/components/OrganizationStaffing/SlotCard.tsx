"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Network, Users, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StaffingSlotItem } from "../../types";
import { MultiSelectModal } from "../MultiSelectModal";

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
  const [geographicAreaIds, setGeographicAreaIds] = useState<number[]>(
    existingSlot?.geographicAreaIds ?? []
  );
  const [monitoredUnitIds, setMonitoredUnitIds] = useState<number[]>(existingSlot?.monitoredUnitIds ?? []);

  useEffect(() => {
    setDescription(existingSlot?.description ?? "");
    setDomainIds(existingSlot?.domainIds ?? []);
    setGeographicAreaIds(existingSlot?.geographicAreaIds ?? []);
    setMonitoredUnitIds(existingSlot?.monitoredUnitIds ?? []);
  }, [existingSlot]);

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm flex flex-col h-full">
      <CardHeader className="py-3 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0 gap-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{slotOrder}</div>
          <span>Vị trí nhân sự</span>
        </CardTitle>
        <Button type="button" size="sm" className="h-8 text-xs font-medium" onClick={() => onSave({ staffingId, slotOrder, description: description.trim() || undefined, geographicAreaIds: geographicAreaIds.length ? geographicAreaIds : undefined, domainIds: domainIds.length ? domainIds : undefined, monitoredUnitIds: monitoredUnitIds.length ? monitoredUnitIds : undefined })} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Lưu vị trí
        </Button>
      </CardHeader>

      <CardContent className="p-4 flex-1 flex flex-col gap-4 text-sm">
        {/* Nhiệm vụ */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Nhiệm vụ được giao</label>
          <textarea className="w-full min-h-[64px] max-h-[120px] rounded-lg border border-input bg-background px-3 py-1.5 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả công việc cụ thể..." />
        </div>

        {/* Lưới danh sách */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">

          {/* LĨNH VỰC */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5"><Network className="h-3.5 w-3.5" /> Lĩnh vực</span>
            </label>
            <MultiSelectModal
              title="Chọn lĩnh vực chuyên môn"
              icon={<Network className="h-5 w-5" />}
              items={domainsForUnit}
              selectedIds={domainIds}
              onChange={setDomainIds}
              placeholderSearch="Tìm lĩnh vực..."
              triggerLabel="Chọn lĩnh vực"
            />
          </div>

          {/* KHU VỰC ĐỊA LÝ */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Địa lý</span>
            </label>
            <MultiSelectModal
              title="Chọn phạm vi địa lý"
              icon={<MapPin className="h-5 w-5" />}
              items={geoAreas}
              selectedIds={geographicAreaIds}
              onChange={setGeographicAreaIds}
              placeholderSearch="Tìm tỉnh thành, khu vực..."
              triggerLabel="Chọn khu vực địa lý"
            />
          </div>

          {/* ĐƠN VỊ TRỰC THUỘC */}
          <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Đơn vị trực thuộc</span>
            </label>
            <MultiSelectModal
              title="Chọn đơn vị trực thuộc"
              icon={<Users className="h-5 w-5" />}
              items={subordinateUnits}
              selectedIds={monitoredUnitIds}
              onChange={setMonitoredUnitIds}
              placeholderSearch="Tìm tên hoặc mã phòng ban..."
              triggerLabel="Chọn đơn vị"
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}