"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Landmark,
  Search,
  X,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FlatUnit } from "../hooks/useOrganizationHierarchy";

interface OrganizationUnitPickerProps {
  selectedUnit?: FlatUnit;
  units: FlatUnit[];
  isLoading: boolean;
  onSelectUnit: (unit: FlatUnit) => void;
  error?: string;
}

/**
 * OrganizationUnitPicker tuân thủ nguyên tắc Dumb Client:
 * - Chỉ hiển thị dữ liệu theo đúng phân loại Backend (categoryCode).
 * - Không chứa business heuristics, regex, hay suy đoán nghiệp vụ dưới client.
 */
export function OrganizationUnitPicker({
  selectedUnit,
  units,
  isLoading,
  onSelectUnit,
  error,
}: OrganizationUnitPickerProps) {
  const [unitSearch, setUnitSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "DANG" | "CHINH_QUYEN" | "SU_NGHIEP">("ALL");
  const [isOpen, setIsOpen] = useState(false);

  // Lọc tìm kiếm cục bộ thuần presentation theo dữ liệu Backend
  const filteredUnits = useMemo(() => {
    const q = unitSearch.trim().toLowerCase();
    return units.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        (u.code && u.code.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (categoryFilter === "ALL") return true;

      // Dumb Client: So khớp trực tiếp trường categoryCode do Backend cung cấp
      return u.categoryCode === categoryFilter;
    });
  }, [units, unitSearch, categoryFilter]);

  // Phân loại khối Đảng hoàn toàn dựa vào Backend Source of Truth
  const isPartyUnit = selectedUnit?.categoryCode === "DANG";

  return (
    <div className="space-y-2.5 min-w-0">
      <div className="flex items-center justify-between gap-2 min-w-0">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 min-w-0 truncate">
          <span>1. Đơn vị công tác (Sở / Ban / Phòng)</span>
          <span className="text-red-500">*</span>
        </label>
        {selectedUnit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen((prev) => !prev)}
            className="h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-2 rounded-lg font-medium shrink-0"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            {isOpen ? "Đóng danh sách" : "Thay đổi đơn vị"}
          </Button>
        )}
      </div>

      {/* THẺ TÓM TẮT ĐƠN VỊ ĐÃ CHỌN */}
      {selectedUnit && !isOpen && (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 shadow-2xs min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
              {isPartyUnit ? <Landmark className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0 rounded shrink-0",
                    isPartyUnit ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  )}
                >
                  {isPartyUnit ? "Khối Cơ quan Đảng" : "Khối Chính quyền / Sự nghiệp"}
                </Badge>
                {selectedUnit.code && (
                  <span className="text-[11px] font-mono font-medium text-slate-500 truncate">
                    [{selectedUnit.code}]
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 leading-snug wrap-break-word">
                {selectedUnit.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight wrap-break-word">
                {selectedUnit.fullPath}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KHỐI TÌM KIẾM & CHỌN ĐƠN VỊ */}
      {(!selectedUnit || isOpen) && (
        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 min-w-0">
          {/* Ô tìm kiếm tức thời */}
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={unitSearch}
              onChange={(e) => setUnitSearch(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc mã đơn vị..."
              className="pl-9 pr-8 h-9 text-xs rounded-lg border-slate-200 bg-white shadow-2xs focus:bg-white w-full min-w-0"
            />
            {unitSearch && (
              <button
                type="button"
                onClick={() => setUnitSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title="Xóa tìm kiếm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Bộ lọc loại cơ quan (dựa trên categoryCode chuẩn từ backend) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] min-w-0">
            <button
              type="button"
              onClick={() => setCategoryFilter("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                categoryFilter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              Tất cả ({units.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("DANG")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                categoryFilter === "DANG"
                  ? "bg-red-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              Khối Đảng
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("CHINH_QUYEN")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                categoryFilter === "CHINH_QUYEN"
                  ? "bg-blue-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              Sở / Ngành
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter("SU_NGHIEP")}
              className={cn(
                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                categoryFilter === "SU_NGHIEP"
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              )}
            >
              Đơn vị sự nghiệp
            </button>
          </div>

          {/* Danh sách cuộn chọn đơn vị */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-w-0">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Đang tải cây tổ chức...
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Không tìm thấy đơn vị phù hợp với từ khóa
              </div>
            ) : (
              filteredUnits.map((u) => {
                const isSelected = selectedUnit?.id === u.id;
                // Dumb Client: Nhận diện biểu tượng hoàn toàn theo Backend categoryCode
                const isDang = u.categoryCode === "DANG";

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      onSelectUnit(u);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "p-2.5 rounded-lg cursor-pointer transition-all border text-left flex items-start gap-2.5 select-none min-w-0",
                      isSelected
                        ? "bg-blue-700 text-white border-blue-800 shadow-xs"
                        : "bg-white hover:bg-blue-50/60 border-slate-200/80 text-slate-800"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDang ? (
                        <Landmark
                          className={cn(
                            "h-3.5 w-3.5",
                            isSelected ? "text-white" : "text-red-600"
                          )}
                        />
                      ) : (
                        <Building2
                          className={cn(
                            "h-3.5 w-3.5",
                            isSelected ? "text-white" : "text-blue-600"
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 justify-between min-w-0">
                        <span className="font-bold text-xs truncate min-w-0">{u.name}</span>
                        {u.code && (
                          <span
                            className={cn(
                              "text-[9px] font-mono px-1 py-0 rounded shrink-0",
                              isSelected ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-500"
                            )}
                          >
                            {u.code}
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] truncate mt-0.5 min-w-0",
                          isSelected ? "text-blue-100" : "text-slate-400"
                        )}
                      >
                        {u.fullPath}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
