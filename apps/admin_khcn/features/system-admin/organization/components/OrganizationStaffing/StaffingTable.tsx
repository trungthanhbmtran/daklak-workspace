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
import { ChevronDown, ChevronRight, UserCheck } from "lucide-react";
import { SlotCard } from "./SlotCard";
import type { StaffingReportItem } from "../../types";
import { cn } from "@/lib/utils";

type StaffingTableProps = {
  report: StaffingReportItem[];
  domainsForUnit: { id: number; name: string }[];
  unitDomainIds: number[];
  onSaveSlot: (payload: {
    staffingId: number;
    slotOrder: number;
    description?: string;
    domainIds?: number[];
    geographicAreaIds?: number[];
    monitoredUnitIds?: number[];
  }) => void;
  subordinateUnits: { id: number; name: string }[];
  isSavingSlot: boolean;
};

export function StaffingTable({
  report,
  domainsForUnit,
  unitDomainIds,
  subordinateUnits,
  onSaveSlot,
  isSavingSlot,
}: StaffingTableProps) {
  const [expandedSlotRowId, setExpandedSlotRowId] = useState<number | null>(null);

  // State quản lý vị trí đang được chọn để cấu hình trong mỗi Chức danh
  // Cấu trúc: { [rowId]: slotOrder }
  const [activeSlotMap, setActiveSlotMap] = useState<Record<number, number>>({});

  const toggleRow = (rowId: number) => {
    const isOpen = expandedSlotRowId === rowId;
    setExpandedSlotRowId(isOpen ? null : rowId);

    // Nếu mở hàng mới và chưa có vị trí mặc định được chọn, đặt mặc định là vị trí số 1
    if (!isOpen && !activeSlotMap[rowId]) {
      setActiveSlotMap((prev) => ({ ...prev, [rowId]: 1 }));
    }
  };

  const changeActiveSlot = (rowId: number, slotOrder: number) => {
    setActiveSlotMap((prev) => ({ ...prev, [rowId]: slotOrder }));
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
          {report.map((row) => {
            const hasSlots = row.quantity >= 1;
            const isSlotOpen = expandedSlotRowId === row.id;
            const currentActiveSlot = activeSlotMap[row.id] || 1;

            return (
              <Fragment key={row.id}>
                {/* Hàng thông tin chính */}
                <TableRow
                  className={cn(
                    "transition-colors group",
                    isSlotOpen && "bg-muted/50 hover:bg-muted/50 border-b-0",
                    hasSlots && "cursor-pointer select-none"
                  )}
                  onClick={() => hasSlots && toggleRow(row.id)}
                >
                  <TableCell className="font-medium p-4">
                    <div className="flex items-center gap-2">
                      {hasSlots && (
                        <div className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                          {isSlotOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className={cn(hasSlots && "group-hover:underline decoration-muted-foreground")}>
                          {row.jobTitleName}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[300px] wrap-break-word whitespace-normal align-top">
                    <div className="max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                      {row.jobTitleDomainName || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{row.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{row.currentCount}</TableCell>
                </TableRow>

                {/* Khu vực mở rộng đã được tối ưu hóa chống rối mắt */}
                {hasSlots && (
                  <TableRow className={cn(
                    "hover:bg-transparent border-t-0",
                    !isSlotOpen && "hidden"
                  )}>
                    <TableCell colSpan={6} className="p-0 bg-muted/10">
                      <Collapsible open={isSlotOpen}>
                        <CollapsibleContent className="border-b border-t transition-all">
                          <div className="p-4 flex flex-col md:flex-row gap-5">

                            {/* SIDEBAR BÊN TRÁI: Chọn số thứ tự vị trí */}
                            <div className="w-full md:w-[200px] shrink-0 space-y-2">
                              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 px-2 py-1">
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Chọn vị trí ({row.quantity})</span>
                              </div>

                              {/* Thanh điều hướng dạng danh sách nút bấm dọc */}
                              <div className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                                {Array.from(
                                  { length: row.quantity },
                                  (_, i) => i + 1
                                ).map((slotOrder) => {
                                  const isSelected = currentActiveSlot === slotOrder;
                                  const hasData = row.slots?.some((s) => s.slotOrder === slotOrder);
                                  const assignedUser = row.assignedUserBySlot?.[slotOrder];

                                  return (
                                    <button
                                      key={slotOrder}
                                      type="button"
                                      onClick={() => changeActiveSlot(row.id, slotOrder)}
                                      className={cn(
                                        "flex flex-col text-left px-3 py-2 text-xs rounded-lg transition-all min-w-[100px] md:w-full border select-none shrink-0 relative",
                                        isSelected
                                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                          : "bg-background text-foreground hover:bg-muted/80 border-border"
                                      )}
                                    >
                                      <div className="flex items-center justify-between w-full">
                                        <span className="font-semibold">Vị trí {slotOrder}</span>
                                        {hasData && (
                                          <span className={cn(
                                            "h-1.5 w-1.5 rounded-full shrink-0",
                                            isSelected ? "bg-primary-foreground" : "bg-emerald-500"
                                          )} />
                                        )}
                                      </div>
                                      <div className={cn(
                                        "mt-0.5 truncate max-w-full text-[11px]",
                                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground",
                                        assignedUser ? "" : "italic opacity-70"
                                      )}>
                                        {assignedUser ? assignedUser : "Chưa có nhân sự"}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* VÙNG BÊN PHẢI: Hiển thị DUY NHẤT 1 SlotCard được chọn */}
                            <div className="flex-1">
                              {(() => {
                                const existingSlot = row.slots?.find(
                                  (s) => s.slotOrder === currentActiveSlot
                                );
                                return (
                                  <div className="animate-in fade-in-50 duration-200">
                                    <SlotCard
                                      staffingId={row.id}
                                      slotOrder={currentActiveSlot}
                                      existingSlot={existingSlot}
                                      domainsForUnit={domainsForUnit}
                                      unitDomainIds={unitDomainIds}
                                      subordinateUnits={subordinateUnits}
                                      onSave={onSaveSlot}
                                      isSaving={isSavingSlot}
                                    />
                                  </div>
                                );
                              })()}
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