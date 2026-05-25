"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Network, Users, Save, Loader2, Search, CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"; // Giả định bạn có Input của shadcn
import type { StaffingSlotItem } from "../../types";
import { cn } from "@/lib/utils";

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
    existingSlot?.geographicAreaIds?.length ? existingSlot.geographicAreaIds :
      (existingSlot?.geographicAreaId ? [existingSlot.geographicAreaId] : [])
  );
  const [monitoredUnitIds, setMonitoredUnitIds] = useState<number[]>(existingSlot?.monitoredUnitIds ?? []);

  // --- STATE TÌM KIẾM ---
  const [searchDomain, setSearchDomain] = useState("");
  const [searchGeo, setSearchGeo] = useState("");
  const [searchUnit, setSearchUnit] = useState("");

  useEffect(() => {
    setDescription(existingSlot?.description ?? "");
    setDomainIds(existingSlot?.domainIds ?? []);
    setGeographicAreaIds(
      existingSlot?.geographicAreaIds?.length ? existingSlot.geographicAreaIds :
        (existingSlot?.geographicAreaId ? [existingSlot.geographicAreaId] : [])
    );
    setMonitoredUnitIds(existingSlot?.monitoredUnitIds ?? []);
  }, [existingSlot]);

  // --- LỌC DANH SÁCH THEO TỪ KHÓA ---
  const filteredDomains = domainsForUnit.filter(d => d.name.toLowerCase().includes(searchDomain.toLowerCase()));
  const filteredGeos = geoAreas.filter(g => g.name.toLowerCase().includes(searchGeo.toLowerCase()));
  const filteredUnits = subordinateUnits.filter(u =>
    u.name.toLowerCase().includes(searchUnit.toLowerCase()) ||
    u.code?.toLowerCase().includes(searchUnit.toLowerCase())
  );

  // --- HÀM TOGGLE KHÔNG ĐỔI ---
  const toggleDomain = (id: number) => setDomainIds(p => p.includes(id) ? p.filter(d => d !== id) : [...p, id]);
  const toggleGeoArea = (id: number) => setGeographicAreaIds(p => p.includes(id) ? p.filter(g => g !== id) : [...p, id]);
  const toggleUnit = (id: number) => setMonitoredUnitIds(p => p.includes(id) ? p.filter(u => u !== id) : [...p, id]);

  // --- HÀM CHỌN NHANH / BỎ CHỌN NHANH ---
  const toggleSelectAllGeo = () => {
    // Nếu đã chọn hết các mục đang hiển thị sau lọc -> Bỏ chọn những mục đó
    const visibleIds = filteredGeos.map(g => g.id);
    const isAllVisibleSelected = visibleIds.every(id => geographicAreaIds.includes(id));

    if (isAllVisibleSelected) {
      setGeographicAreaIds(p => p.filter(id => !visibleIds.includes(id)));
    } else {
      setGeographicAreaIds(p => Array.from(new Set([...p, ...visibleIds])));
    }
  };

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
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Network className="h-3.5 w-3.5" /> Lĩnh vực</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary">{domainIds.length} chọn</Badge>
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" placeholder="Tìm lĩnh vực..." value={searchDomain} onChange={e => setSearchDomain(e.target.value)} className="w-full pl-8 pr-3 py-1 h-8 rounded-t-lg border border-b-0 border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="border rounded-b-lg bg-muted/20 p-1.5 h-[110px] overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredDomains.length === 0 ? <p className="text-xs text-muted-foreground italic p-1">Không tìm thấy.</p> : filteredDomains.map(d => (
                <label key={d.id} className={cn("flex items-center gap-2 cursor-pointer p-1.5 rounded-md text-xs transition-colors select-none", domainIds.includes(d.id) ? "bg-background font-medium text-primary shadow-sm" : "hover:bg-background/60 text-muted-foreground")}>
                  <Checkbox checked={domainIds.includes(d.id)} onCheckedChange={() => toggleDomain(d.id)} className="h-3.5 w-3.5" />
                  <span className="truncate">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* KHU VỰC ĐỊA LÝ (Tối ưu nâng cao với Tìm kiếm + Chọn tất cả) */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Địa lý</span>
              <div className="flex items-center gap-1.5">
                {geoAreas.length > 0 && (
                  <button type="button" onClick={toggleSelectAllGeo} className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-normal normal-case">
                    Lọc nhanh tất cả
                  </button>
                )}
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary">{geographicAreaIds.length} chọn</Badge>
              </div>
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" placeholder="Tìm tỉnh thành, khu vực..." value={searchGeo} onChange={e => setSearchGeo(e.target.value)} className="w-full pl-8 pr-3 py-1 h-8 rounded-t-lg border border-b-0 border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="border rounded-b-lg bg-muted/20 p-1.5 h-[110px] overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredGeos.length === 0 ? <p className="text-xs text-muted-foreground italic p-1">Không tìm thấy.</p> : filteredGeos.map(g => (
                <label key={g.id} className={cn("flex items-center gap-2 cursor-pointer p-1.5 rounded-md text-xs transition-colors select-none", geographicAreaIds.includes(g.id) ? "bg-background font-medium text-primary shadow-sm" : "hover:bg-background/60 text-muted-foreground")}>
                  <Checkbox checked={geographicAreaIds.includes(g.id)} onCheckedChange={() => toggleGeoArea(g.id)} className="h-3.5 w-3.5" />
                  <span className="truncate">{g.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ĐƠN VỊ TRỰC THUỘC */}
          <div className="flex flex-col space-y-1.5 sm:col-span-2 lg:col-span-1 xl:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Đơn vị trực thuộc</span>
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary">{monitoredUnitIds.length} chọn</Badge>
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" placeholder="Tìm tên hoặc mã phòng ban..." value={searchUnit} onChange={e => setSearchUnit(e.target.value)} className="w-full pl-8 pr-3 py-1 h-8 rounded-t-lg border border-b-0 border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
            <div className="border rounded-b-lg bg-muted/20 p-1.5 h-[110px] overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredUnits.length === 0 ? <p className="text-xs text-muted-foreground italic p-1">Không tìm thấy.</p> : filteredUnits.map(u => (
                <label key={u.id} className={cn("flex items-center gap-2 cursor-pointer p-1.5 rounded-md text-xs transition-colors select-none justify-between", monitoredUnitIds.includes(u.id) ? "bg-background font-medium text-primary shadow-sm" : "hover:bg-background/60 text-muted-foreground")}>
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <Checkbox checked={monitoredUnitIds.includes(u.id)} onCheckedChange={() => toggleUnit(u.id)} className="h-3.5 w-3.5" />
                    <span className="truncate">{u.name}</span>
                  </div>
                  {u.code && <span className={cn("text-[10px] px-1 ml-2 rounded uppercase font-mono font-bold shrink-0", monitoredUnitIds.includes(u.id) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>{u.code}</span>}
                </label>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}