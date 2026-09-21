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
  onSave: (p: { staffingId: number; slotOrder: number; domainIds?: number[]; geographicAreaIds?: number[]; monitoredUnitIds?: number[] }) => void;
  isSaving: boolean;
};

export function SlotCard({ staffingId, slotOrder, existingSlot, domainsForUnit, unitDomainIds, subordinateUnits, onSave, isSaving }: Props) {
  const [domainIds, setDomainIds] = useState<number[]>(existingSlot?.domainIds ?? []);
  const [geoAreaIds, setGeoAreaIds] = useState<number[]>(existingSlot?.geographicAreaIds ?? []);
  const [unitIds, setUnitIds] = useState<number[]>(existingSlot?.monitoredUnitIds ?? []);

  const { items: geoAreas, isFetching: loadingGeo, q: geoQ, setQ: setGeoQ, hasNextPage, fetchNextPage, isFetchingNextPage } = useGeoAreaSearch(geoAreaIds);

  useEffect(() => {
    setDomainIds(existingSlot?.domainIds ?? []);
    setGeoAreaIds(existingSlot?.geographicAreaIds ?? []);
    setUnitIds(existingSlot?.monitoredUnitIds ?? []);
  }, [existingSlot]);

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm flex flex-col h-full">
      <CardHeader className="py-3 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0 gap-2 shrink-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{slotOrder}</div>
          <span>Vi tri nhan su</span>
        </CardTitle>
        <Button type="button" size="sm" className="h-8 text-xs font-medium"
          onClick={() => onSave({ staffingId, slotOrder, domainIds: domainIds.length ? domainIds : undefined, geographicAreaIds: geoAreaIds.length ? geoAreaIds : undefined, monitoredUnitIds: unitIds.length ? unitIds : undefined })}
          disabled={isSaving}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Luu vi tri
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col gap-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Network className="h-3.5 w-3.5" /> Linh vuc</label>
            <PopoverMultiSelect title="Chon linh vuc" icon={<Network className="h-5 w-5" />} items={domainsForUnit} selectedIds={domainIds} onChange={setDomainIds} placeholderSearch="Tim linh vuc..." triggerLabel="Chon linh vuc" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Dia ly</label>
            <PopoverMultiSelect title="Chon khu vuc dia ly" icon={<MapPin className="h-5 w-5" />} items={geoAreas} selectedIds={geoAreaIds} onChange={setGeoAreaIds} placeholderSearch="Tim dia ban..." triggerLabel="Chon dia ban" search={geoQ} onSearchChange={setGeoQ} isLoading={loadingGeo} hasNextPage={hasNextPage} fetchNextPage={fetchNextPage} isFetchingNextPage={isFetchingNextPage} />
          </div>
          <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Don vi truc thuoc</label>
            <PopoverMultiSelect title="Chon don vi truc thuoc" icon={<Users className="h-5 w-5" />} items={subordinateUnits} selectedIds={unitIds} onChange={setUnitIds} placeholderSearch="Tim don vi..." triggerLabel="Chon don vi" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
