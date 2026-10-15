/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useWatch, type Control, type UseFormSetValue, type FieldErrors } from "react-hook-form";
import {
  Building2,
  CheckCircle2,
  ShieldAlert,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { OrganizationUnitPicker } from "./OrganizationUnitPicker";
import type { FlatUnit } from "../hooks/useOrganizationHierarchy";
import type { EmployeeCreateFormValues } from "../types";

interface EmployeeOrganizationCardProps {
  control: Control<EmployeeCreateFormValues>;
  setValue: UseFormSetValue<EmployeeCreateFormValues>;
  units: FlatUnit[];
  isLoadingUnits: boolean;
  partyTitles: any[];
  govTitles: any[];
  allTitles: any[];
  isLoadingJobs: boolean;
  staffingReport: any;
  errors: FieldErrors<EmployeeCreateFormValues>;
}

/**
 * EmployeeOrganizationCard tuân thủ nguyên tắc Dumb Client:
 * - Nhận danh sách chức danh đã được Backend phân loại sẵn (partyTitles, govTitles).
 * - Không tự filter, không tự chế heuristics xác định loại đơn vị.
 * - Nhận diện khối Đảng trực tiếp từ trường categoryCode của Backend.
 */
export function EmployeeOrganizationCard({
  control,
  setValue,
  units,
  isLoadingUnits,
  partyTitles,
  govTitles,
  isLoadingJobs,
  staffingReport,
  errors,
}: EmployeeOrganizationCardProps) {
  const departmentId = useWatch({ control, name: "departmentId" });
  const selectedJobTitleId = useWatch({ control, name: "jobTitleId" });
  const selectedPartyTitleId = useWatch({ control, name: "partyTitleId" });
  const selectedSlotOrder = useWatch({ control, name: "slotOrder" });

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === departmentId),
    [units, departmentId]
  );

  // Dumb Client: Nhận diện khối Đảng trực tiếp từ trường categoryCode của Backend Source of Truth
  const isPartyUnit = selectedUnit?.categoryCode === "DANG";

  const effectiveJobTitleId = isPartyUnit
    ? selectedPartyTitleId || selectedJobTitleId
    : selectedJobTitleId || selectedPartyTitleId;

  const activeStaffingRow = useMemo(() => {
    if (!effectiveJobTitleId || !staffingReport?.data) return undefined;
    return (staffingReport.data as any[]).find((s: any) => s.jobTitleId === effectiveJobTitleId);
  }, [effectiveJobTitleId, staffingReport]);

  const quotaInfo = activeStaffingRow
    ? {
        quantity: activeStaffingRow.quantity,
        currentCount: activeStaffingRow.currentCount ?? 0,
        slots: activeStaffingRow.slots || [],
      }
    : undefined;

  const handleSelectUnit = (unit: FlatUnit) => {
    setValue("departmentId", unit.id, { shouldValidate: true, shouldDirty: true });
    setValue("jobTitleId", undefined, { shouldDirty: true });
    setValue("partyTitleId", undefined, { shouldDirty: true });
    setValue("slotOrder", undefined, { shouldDirty: true });
  };

  return (
    <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden min-w-0">
      <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-xs shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-bold text-slate-900 truncate">
              3. Cơ quan & Vị trí việc làm (VTVL)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 truncate">
              Chọn cơ quan và phân công slot định biên đã phê duyệt
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-5 min-w-0">
        {/* BƯỚC 1: CHỌN ĐƠN VỊ CÔNG TÁC */}
        <OrganizationUnitPicker
          selectedUnit={selectedUnit}
          units={units}
          isLoading={isLoadingUnits}
          onSelectUnit={handleSelectUnit}
          error={errors.departmentId?.message}
        />

        <Separator className="bg-slate-100 my-1" />

        {/* BƯỚC 2: CHỌN CHỨC VỤ / VỊ TRÍ VIỆC LÀM */}
        <div className="space-y-4 min-w-0">
          {isPartyUnit ? (
            <>
              {/* Chức danh Đảng (dành cho Khối Đảng) */}
              <FormField
                control={control}
                name="partyTitleId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 min-w-0">
                    <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between min-w-0">
                      <span className="truncate">2. Chức danh / VTVL Đảng</span>
                      <span className="text-red-500 font-semibold shrink-0">* Khối Đảng</span>
                    </FormLabel>
                    <Select
                      disabled={!departmentId}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : undefined);
                        setValue("slotOrder", undefined, { shouldDirty: true });
                      }}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-semibold focus:border-blue-500 truncate [&>span]:truncate"
                          title="Chọn chức vụ khối Đảng"
                        >
                          <SelectValue placeholder="-- Chọn chức vụ khối Đảng --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partyTitles.map((j: any) => {
                          const rep = (staffingReport?.data as any[] || []).find((s: any) => s.jobTitleId === j.id);
                          const qty = rep ? rep.quantity : null;
                          const cnt = rep ? rep.currentCount ?? 0 : 0;
                          const rem = qty !== null ? qty - cnt : null;
                          return (
                            <SelectItem key={j.id} value={String(j.id)}>
                              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                                <span className="font-medium truncate" title={j.name}>{j.name}</span>
                                {qty !== null && (
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                      rem !== null && rem <= 0
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    )}
                                  >
                                    Định biên: {cnt}/{qty}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Chức vụ chính quyền kiêm nhiệm nếu có */}
              {govTitles.length > 0 && (
                <FormField
                  control={control}
                  name="jobTitleId"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 min-w-0">
                      <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                        Chức vụ chính quyền kiêm nhiệm (Không bắt buộc)
                      </FormLabel>
                      <Select
                        disabled={!departmentId}
                        onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium truncate [&>span]:truncate"
                            title="Chọn chức vụ chính quyền kiêm nhiệm"
                          >
                            <SelectValue placeholder="-- Chọn chức vụ chính quyền --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {govTitles.map((j: any) => (
                            <SelectItem key={j.id} value={String(j.id)}>
                              <span className="truncate" title={j.name}>{j.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}
            </>
          ) : (
            <>
              {/* Chức vụ chính quyền (đơn vị thông thường) */}
              <FormField
                control={control}
                name="jobTitleId"
                render={({ field }) => (
                  <FormItem className="space-y-1.5 min-w-0">
                    <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between min-w-0">
                      <span className="truncate">2. Chức vụ chính quyền</span>
                      <span className="text-blue-600 font-semibold shrink-0">Chính quyền / Sở ngành</span>
                    </FormLabel>
                    <Select
                      disabled={!departmentId}
                      onValueChange={(val) => {
                        field.onChange(val ? Number(val) : undefined);
                        setValue("slotOrder", undefined, { shouldDirty: true });
                      }}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-semibold focus:border-blue-500 truncate [&>span]:truncate"
                          title="Chọn chức vụ chính quyền"
                        >
                          <SelectValue placeholder="-- Chọn chức vụ chính quyền --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {govTitles.map((j: any) => {
                          const rep = (staffingReport?.data as any[] || []).find((s: any) => s.jobTitleId === j.id);
                          const qty = rep ? rep.quantity : null;
                          const cnt = rep ? rep.currentCount ?? 0 : 0;
                          const rem = qty !== null ? qty - cnt : null;
                          return (
                            <SelectItem key={j.id} value={String(j.id)}>
                              <div className="flex items-center justify-between gap-3 w-full min-w-0">
                                <span className="font-medium truncate" title={j.name}>{j.name}</span>
                                {qty !== null && (
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                      rem !== null && rem <= 0
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                    )}
                                  >
                                    Định biên: {cnt}/{qty}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Chức vụ Đảng kiêm nhiệm nếu có */}
              {partyTitles.length > 0 && (
                <FormField
                  control={control}
                  name="partyTitleId"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 min-w-0">
                      <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider truncate">
                        Chức vụ Đảng (Không bắt buộc)
                      </FormLabel>
                      <Select
                        disabled={!departmentId}
                        onValueChange={(val) => {
                          field.onChange(val ? Number(val) : undefined);
                          if (!selectedJobTitleId) {
                            setValue("slotOrder", undefined, { shouldDirty: true });
                          }
                        }}
                        value={field.value ? String(field.value) : undefined}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-10 w-full min-w-0 rounded-xl border-slate-200 bg-white text-sm font-medium truncate [&>span]:truncate"
                            title="Chọn chức vụ Đảng"
                          >
                            <SelectValue placeholder="-- Chọn chức vụ Đảng --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {partyTitles.map((j: any) => (
                            <SelectItem key={j.id} value={String(j.id)}>
                              <span className="truncate" title={j.name}>{j.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          {/* CHỈ SỐ ĐỊNH BIÊN VTVL */}
          {quotaInfo !== undefined && (
            <div
              className={cn(
                "flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all min-w-0",
                quotaInfo.currentCount >= quotaInfo.quantity
                  ? "bg-amber-50/80 text-amber-900 border-amber-200"
                  : "bg-emerald-50/80 text-emerald-900 border-emerald-200"
              )}
            >
              {quotaInfo.currentCount >= quotaInfo.quantity ? (
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              )}
              <div className="flex-1 min-w-0 leading-snug wrap-break-word">
                <span>Định biên VTVL: </span>
                <span className="font-bold underline decoration-2">
                  {quotaInfo.currentCount}/{quotaInfo.quantity}
                </span>
                <span> &mdash; </span>
                <span>
                  {quotaInfo.currentCount >= quotaInfo.quantity
                    ? "Đã bố trí đủ chỉ tiêu. Vẫn có thể chọn slot để chuyển giao / bổ nhiệm thay thế."
                    : `Còn ${quotaInfo.quantity - quotaInfo.currentCount} vị trí biên chế sẵn sàng bổ nhiệm.`}
                </span>
              </div>
            </div>
          )}

          {/* BƯỚC 3: CHỌN VỊ TRÍ (SLOTS) ĐỊNH BIÊN CỤ THỂ */}
          {activeStaffingRow && activeStaffingRow.quantity > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200/80 min-w-0">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <UserCheck className="h-4 w-4 text-blue-700 shrink-0" />
                    <span className="truncate">3. Phân công Slot VTVL ({activeStaffingRow.quantity} vị trí)</span>
                  </FormLabel>
                  <Text variant="small" className="text-[11px] text-slate-500 truncate">
                    Nhấp chọn slot phân công cụ thể cho cán bộ
                  </Text>
                </div>
                {selectedSlotOrder && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue("slotOrder", undefined, { shouldDirty: true })}
                    className="text-xs h-7 text-slate-500 hover:text-red-600 px-2 rounded-lg shrink-0"
                  >
                    Bỏ chọn
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar min-w-0">
                {Array.from({ length: activeStaffingRow.quantity }, (_, i) => i + 1).map((slotNum) => {
                  const slotData = (activeStaffingRow.slots || []).find((s: any) => s.slotOrder === slotNum);
                  const isAssigned = !!(slotData?.assignedEmployeeCode || slotData?.assignedEmployeeName);
                  const isSelected = selectedSlotOrder === slotNum;

                  return (
                    <div
                      key={slotNum}
                      onClick={() => {
                        setValue("slotOrder", isSelected ? undefined : slotNum, { shouldValidate: true, shouldDirty: true });
                      }}
                      className={cn(
                        "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 select-none min-w-0",
                        isSelected
                          ? "bg-blue-50/90 border-blue-600 shadow-xs ring-2 ring-blue-600/30 text-blue-950"
                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-1.5 min-w-0">
                          <span
                            className={cn(
                              "flex items-center justify-center h-5 w-5 rounded-md text-[11px] font-bold shrink-0",
                              isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                            )}
                          >
                            #{slotNum}
                          </span>

                          {isAssigned ? (
                            <Badge
                              variant="outline"
                              className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-semibold px-1.5 py-0 shrink-0"
                            >
                              Đã có cán bộ
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-semibold px-1.5 py-0 shrink-0"
                            >
                              Còn trống
                            </Badge>
                          )}
                        </div>

                        <div className="text-xs font-bold mt-1.5 truncate" title={slotData?.description || `Vị trí ${slotNum}`}>
                          {slotData?.description ? slotData.description.split(" (")[0] : `Vị trí ${slotNum}`}
                        </div>

                        {isAssigned && (
                          <div className="text-[10px] text-amber-800 font-medium truncate mt-0.5">
                            CB: <strong>{slotData.assignedEmployeeName || slotData.assignedEmployeeCode}</strong>
                          </div>
                        )}
                      </div>

                      {slotData?.domains && slotData.domains.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100 min-w-0">
                          {slotData.domains.map((d: any) => (
                            <span
                              key={d.id}
                              className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-normal truncate max-w-[120px]"
                              title={d.name}
                            >
                              {d.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isLoadingJobs && (
            <div className="flex items-center gap-2 text-xs text-blue-600 font-medium py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải danh sách chức danh...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
