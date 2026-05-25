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
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { SlotCard } from "./SlotCard";
import type { StaffingReportItem } from "../../types";
import { cn } from "@/lib/utils"; // Giả định bạn có hàm cn của shadcn

type StaffingTableProps = {
  report: StaffingReportItem[];
  domainsForUnit: { id: number; name: string }[];
  geoAreas: { id: number; name: string }[];
  subordinateUnits: { id: number; name: string; code?: string }[];
  onSaveSlot: (payload: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    geographicAreaIds?: number[];
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

  const toggleRow = (rowId: number) => {
    setExpandedSlotRowId(expandedSlotRowId === rowId ? null : rowId);
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground w-[250px]">Chức danh</TableHead>
            <TableHead className="font-semibold text-foreground">Lĩnh vực phụ trách</TableHead>
            <TableHead className="font-semibold text-foreground">Theo dõi phòng ban</TableHead>
            <TableHead className="font-semibold text-foreground">Khu vực địa lý</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-24">Định biên</TableHead>
            <TableHead className="text-right font-semibold text-foreground w-20">Hiện có</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.map((row) => {
            const hasSlots = row.quantity >= 1;
            const isSlotOpen = expandedSlotRowId === row.id;

            return (
              <Fragment key={row.id}>
                {/* Hàng chính */}
                <TableRow
                  className={cn(
                    "transition-colors group",
                    isSlotOpen && "bg-muted/40 hover:bg-muted/40 border-b-0",
                    hasSlots && "cursor-pointer select-none"
                  )}
                  onClick={() => hasSlots && toggleRow(row.id)}
                >
                  <TableCell className="font-medium p-4">
                    <div className="flex items-center gap-2">
                      {hasSlots && (
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                          {isSlotOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      <span className={cn(hasSlots && "group-hover:underline decoration-muted-foreground")}>
                        {row.jobTitleName}
                      </span>
                    </div>
                  </TableCell>
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
                  <TableCell className="text-right tabular-nums font-medium">{row.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{row.currentCount}</TableCell>
                </TableRow>

                {/* Hàng chứa nội dung mở rộng */}
                {hasSlots && (
                  <TableRow className={cn(
                    "hover:bg-transparent border-t-0",
                    !isSlotOpen && "hidden"
                  )}>
                    <TableCell colSpan={6} className="p-0">
                      <Collapsible open={isSlotOpen}>
                        <CollapsibleContent className="bg-muted/20 border-b transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          <div className="px-6 py-4">
                            {/* Tiêu đề phần phân công nhỏ */}
                            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              <Users className="h-3.5 w-3.5" />
                              <span>Phân công chi tiết vị trí ({row.quantity} định biên)</span>
                            </div>

                            {/* Danh sách thẻ Card */}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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