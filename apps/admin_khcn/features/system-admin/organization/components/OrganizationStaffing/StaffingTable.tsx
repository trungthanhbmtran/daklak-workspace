"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SlotCard } from "./SlotCard";
import type { StaffingReportItem } from "../../types";

type StaffingTableProps = {
  report: StaffingReportItem[];
  domainsForUnit: { id: number; name: string }[];
  geoAreas: { id: number; name: string }[];
  subordinateUnits: { id: number; name: string; code?: string }[];
  onSaveSlot: (payload: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    geographicAreaId?: number;
    domainIds?: number[];
    monitoredUnitIds?: number[];
  }) => void;
  isSavingSlot: boolean;
};

export function StaffingTable({
  report,
  domainsForUnit,
  geoAreas,
  subordinateUnits,
  onSaveSlot,
  isSavingSlot,
}: StaffingTableProps) {
  const [expandedSlotRowId, setExpandedSlotRowId] = useState<number | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="font-medium">Chức danh</TableHead>
          <TableHead className="font-medium text-muted-foreground">Lĩnh vực phụ trách</TableHead>
          <TableHead className="font-medium text-muted-foreground">Theo dõi phòng ban</TableHead>
          <TableHead className="font-medium text-muted-foreground">Khu vực địa lý</TableHead>
          <TableHead className="text-right font-medium w-24">Định biên</TableHead>
          <TableHead className="text-right font-medium w-20">Hiện có</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {report.map((row) => {
          const hasSlots = row.quantity >= 1;
          const isSlotOpen = expandedSlotRowId === row.id;
          return (
            <Fragment key={row.id}>
              <TableRow>
                <TableCell className="font-medium">{row.jobTitleName}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.jobTitleDomainName || "—"}
                </TableCell>
                <TableCell
                  className="text-muted-foreground text-sm max-w-[160px] truncate"
                  title={(row.jobTitleMonitoredUnitNames ?? []).join(", ")}
                >
                  {(row.jobTitleMonitoredUnitNames ?? []).length
                    ? row.jobTitleMonitoredUnitNames!.join(", ")
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.jobTitleGeographicAreaName || "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.quantity}</TableCell>
                <TableCell className="text-right tabular-nums">{row.currentCount}</TableCell>
              </TableRow>
              {hasSlots && (
                <TableRow className="hover:bg-muted/30">
                  <TableCell colSpan={6} className="p-0 bg-muted/20">
                    <Collapsible
                      open={isSlotOpen}
                      onOpenChange={(o) =>
                        setExpandedSlotRowId(o ? row.id : null)
                      }
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                        >
                          {isSlotOpen ? (
                            <ChevronDown className="h-4 w-4 shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                          <span>
                            Phân công từng vị trí ({row.quantity} vị trí) — lĩnh vực, nhiệm vụ, khu vực riêng từng phó
                          </span>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {Array.from(
                            { length: row.quantity },
                            (_, i) => i + 1
                          ).map((slotOrder) => {
                            const existingSlot = row.slots?.find(
                              (s) => s.slotOrder === slotOrder
                            );
                            return (
                              <SlotCard
                                key={`${row.id}-${slotOrder}`}
                                staffingId={row.id}
                                slotOrder={slotOrder}
                                existingSlot={existingSlot}
                                domainsForUnit={domainsForUnit}
                                geoAreas={geoAreas}
                                subordinateUnits={subordinateUnits}
                                onSave={onSaveSlot}
                                isSaving={isSavingSlot}
                              />
                            );
                          })}
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
  );
}
