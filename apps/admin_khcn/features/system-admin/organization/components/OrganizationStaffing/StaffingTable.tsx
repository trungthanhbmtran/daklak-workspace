"use client";

import { useState, Fragment } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, UserCheck } from "lucide-react";
import { SlotCard } from "./SlotCard";
import type { StaffingReportItem } from "../../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  report: StaffingReportItem[];
  domainsForUnit: { id: number; name: string }[];
  unitDomainIds: number[];
  subordinateUnits: { id: number; name: string }[];
  onSaveSlot: (p: { staffingId: number; slotOrder: number; description?: string; domainIds?: number[]; geographicAreaIds?: number[]; monitoredUnitIds?: number[] }) => void;
  isSavingSlot: boolean;
};

export function StaffingTable({ report, domainsForUnit, unitDomainIds, subordinateUnits, onSaveSlot, isSavingSlot }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeSlotMap, setActiveSlotMap] = useState<Record<number, number>>({});

  const toggleRow = (id: number) => {
    const opening = expandedId !== id;
    setExpandedId(opening ? id : null);
    if (opening && !activeSlotMap[id]) setActiveSlotMap(p => ({ ...p, [id]: 1 }));
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground w-[260px]">Chức danh</TableHead>
            <TableHead className="font-semibold text-foreground">Lĩnh vực phụ trách</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-24">Định biên</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-20">Hiện có</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.map(row => {
            const hasSlots = row.quantity >= 1;
            const isOpen = expandedId === row.id;
            const activeSlot = activeSlotMap[row.id] || 1;
            return (
              <Fragment key={row.id}>
                <TableRow className={cn("transition-colors group", isOpen && "bg-muted/50 hover:bg-muted/50 border-b-0", hasSlots && "cursor-pointer select-none")} onClick={() => hasSlots && toggleRow(row.id)}>
                  <TableCell className="font-medium p-4">
                    <div className="flex items-center gap-2">
                      {hasSlots && <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div>}
                      <span className={cn(hasSlots && "group-hover:underline decoration-muted-foreground")}>{row.jobTitleName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[300px] whitespace-normal align-top">
                    <div className="max-h-[120px] overflow-y-auto pr-2">{row.jobTitleDomainName || "—"}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{row.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{row.currentCount}</TableCell>
                </TableRow>
                {hasSlots && (
                  <TableRow className={cn("hover:bg-transparent border-t-0", !isOpen && "hidden")}>
                    <TableCell colSpan={4} className="p-0 bg-muted/10">
                      <Collapsible open={isOpen}>
                        <CollapsibleContent className="border-b border-t transition-all">
                          <div className="p-4 flex flex-col md:flex-row gap-5">
                            <div className="w-full md:w-[200px] shrink-0 space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-2 py-1">
                                <UserCheck className="h-3.5 w-3.5" /><span>Chọn vị trí ({row.quantity})</span>
                              </div>
                              <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                                {Array.from({ length: row.quantity }, (_, i) => i + 1).map(slotOrder => {
                                  const isSel = activeSlot === slotOrder;
                                  const existing = row.slots?.find(s => s.slotOrder === slotOrder);
                                  return (
                                    <Button key={slotOrder} type="button" onClick={() => setActiveSlotMap(p => ({ ...p, [row.id]: slotOrder }))}
                                      className={cn("flex flex-col text-left px-3 py-2 text-xs rounded-lg transition-all min-w-[100px] md:w-full border select-none shrink-0 relative", isSel ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-foreground hover:bg-muted/80 border-border")}>
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Vị trí {slotOrder}</span>
                                        {existing && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isSel ? "bg-primary-foreground" : "bg-emerald-500")} />}
                                      </div>
                                      <div className={cn("mt-0.5 truncate max-w-full text-[11px]", isSel ? "text-primary-foreground/90" : "text-muted-foreground", existing?.assignedEmployeeName ? "" : "italic opacity-70")}>
                                        {existing?.assignedEmployeeName || "Chưa có nhân sự"}
                                      </div>
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="animate-in fade-in-50 duration-200">
                                <SlotCard staffingId={row.id} slotOrder={activeSlot} existingSlot={row.slots?.find(s => s.slotOrder === activeSlot)} domainsForUnit={domainsForUnit} unitDomainIds={unitDomainIds} subordinateUnits={subordinateUnits} onSave={onSaveSlot} isSaving={isSavingSlot} />
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
