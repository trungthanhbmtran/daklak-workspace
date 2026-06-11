"use client";

import {
  Landmark, Flag, BookOpen, FlaskConical, GraduationCap,
  Building, Building2, Shield, Users, Briefcase, Star,
  CheckCircle2, RefreshCw, ShieldCheck, Scale, ClipboardList,
  Gavel, UserCheck, Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";
import {
  getUnitCategoryConfig,
  SIGNING_AUTHORITY_LABEL,
  POLITICAL_SYSTEM_LABEL,
} from "../constants/unitCategoryTaxonomy";

// ── Icon map ─────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Landmark, Flag, BookOpen, FlaskConical, GraduationCap,
  Building, Building2, Shield, Users, Briefcase, Star,
  ShieldCheck, Scale, ClipboardList, Gavel, UserCheck, Network,
};

// ── Color map ─────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, {
  border: string; bg: string; bgSelected: string;
  icon: string; text: string; badge: string; badgeBg: string;
}> = {
  blue:    { border: "border-blue-400",    bg: "bg-blue-50/60 dark:bg-blue-950/30",    bgSelected: "bg-blue-100 dark:bg-blue-900/50",    icon: "text-blue-500",    text: "text-blue-800 dark:text-blue-200",    badge: "text-blue-700",   badgeBg: "bg-blue-100 dark:bg-blue-900" },
  red:     { border: "border-red-400",     bg: "bg-red-50/60 dark:bg-red-950/30",      bgSelected: "bg-red-100 dark:bg-red-900/50",      icon: "text-red-500",     text: "text-red-800 dark:text-red-200",      badge: "text-red-700",    badgeBg: "bg-red-100 dark:bg-red-900" },
  violet:  { border: "border-violet-400",  bg: "bg-violet-50/60 dark:bg-violet-950/30",bgSelected: "bg-violet-100 dark:bg-violet-900/50",icon: "text-violet-500",  text: "text-violet-800 dark:text-violet-200",badge: "text-violet-700", badgeBg: "bg-violet-100 dark:bg-violet-900" },
  emerald: { border: "border-emerald-400", bg: "bg-emerald-50/60 dark:bg-emerald-950/30",bgSelected:"bg-emerald-100 dark:bg-emerald-900/50",icon:"text-emerald-500",text:"text-emerald-800 dark:text-emerald-200",badge:"text-emerald-700",badgeBg:"bg-emerald-100 dark:bg-emerald-900" },
  amber:   { border: "border-amber-400",   bg: "bg-amber-50/60 dark:bg-amber-950/30",  bgSelected: "bg-amber-100 dark:bg-amber-900/50",  icon: "text-amber-500",   text: "text-amber-800 dark:text-amber-200",   badge: "text-amber-700",  badgeBg: "bg-amber-100 dark:bg-amber-900" },
  slate:   { border: "border-slate-400",   bg: "bg-slate-50/60 dark:bg-slate-800/30",  bgSelected: "bg-slate-100 dark:bg-slate-700/50",  icon: "text-slate-500",   text: "text-slate-800 dark:text-slate-200",   badge: "text-slate-700",  badgeBg: "bg-slate-100 dark:bg-slate-800" },
  indigo:  { border: "border-indigo-400",  bg: "bg-indigo-50/60 dark:bg-indigo-950/30",bgSelected: "bg-indigo-100 dark:bg-indigo-900/50",icon: "text-indigo-500",  text: "text-indigo-800 dark:text-indigo-200", badge: "text-indigo-700", badgeBg: "bg-indigo-100 dark:bg-indigo-900" },
  teal:    { border: "border-teal-400",    bg: "bg-teal-50/60 dark:bg-teal-950/30",    bgSelected: "bg-teal-100 dark:bg-teal-900/50",    icon: "text-teal-500",    text: "text-teal-800 dark:text-teal-200",     badge: "text-teal-700",   badgeBg: "bg-teal-100 dark:bg-teal-900" },
};
const DEFAULT_C = COLOR_MAP["slate"];

interface UnitTypeSelectorProps {
  /** categoryCode hiện tại: "CHINH_QUYEN" | "DANG" | "THAM_MUU" | ... */
  value: string;
  onChange: (categoryCode: string) => void;
  disabled?: boolean;
  /** Hiển thị compact (không show authority/workflow notes) */
  compact?: boolean;
}

/**
 * UnitTypeSelector — bộ chọn phân loại tổ chức toàn diện.
 *
 * Kết hợp:
 *  - Presentation config từ server (/categories?group=UNIT_TYPE_CATEGORY): icon, màu, label
 *  - Business rules từ unitCategoryTaxonomy: thẩm quyền, chức danh, luồng giao việc
 *
 * Chọn 1 click → categoryCode được lưu trên đơn vị, drive toàn bộ logic hệ thống.
 */
export function UnitTypeSelector({
  value,
  onChange,
  disabled,
  compact = false,
}: UnitTypeSelectorProps) {
  const { data: items = [], isLoading, isError, refetch } = useGetCategoryByGroup(
    UNIT_TYPE_CATEGORY_GROUP
  );

  const sorted = [...items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const selectedItem = sorted.find((i) => i.code === value);
  const selectedMeta = selectedItem ? parseUnitTypeCategoryMeta(selectedItem) : null;
  const selectedConfig = value ? getUnitCategoryConfig(value) : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 border rounded-xl bg-muted/10 text-center px-4">
        <Building2 className="h-7 w-7 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">
          {isError ? "Không tải được danh mục." : "Chưa có danh mục phân loại."}
        </p>
        <button type="button" onClick={() => refetch()}
          className="flex items-center gap-1 text-xs text-primary hover:underline">
          <RefreshCw className="h-3 w-3" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", disabled && "opacity-50 pointer-events-none")}>

      {/* GRID CARD CHỌN PHÂN LOẠI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.map((item) => {
          const meta = parseUnitTypeCategoryMeta(item);
          const config = getUnitCategoryConfig(item.code);
          const Icon = ICON_MAP[meta.icon] ?? Building2;
          const c = COLOR_MAP[meta.color] ?? DEFAULT_C;
          const isSelected = value === item.code;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => onChange(item.code)}
              className={cn(
                "relative group flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                isSelected
                  ? cn("border-current shadow-md", c.border, c.bgSelected)
                  : cn("border-transparent hover:border-muted-foreground/25 hover:shadow-sm", c.bg),
                c.text
              )}
            >
              {/* Checkmark */}
              {isSelected && (
                <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 shrink-0" />
              )}

              {/* Icon */}
              <div className={cn(
                "mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "bg-white/60 dark:bg-black/20" : "bg-white/40 dark:bg-white/5"
              )}>
                <Icon className={cn("h-4.5 w-4.5", c.icon)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[13px] font-bold leading-tight line-clamp-1">{item.name}</p>
                {meta.description && (
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 font-normal">
                    {meta.description}
                  </p>
                )}
                {/* Signing authority badge từ taxonomy */}
                {config && (
                  <span className={cn(
                    "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5",
                    c.badgeBg, c.badge
                  )}>
                    {SIGNING_AUTHORITY_LABEL[config.signingAuthority].label}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* PANEL THÔNG TIN KHI ĐÃ CHỌN */}
      {!compact && value && selectedConfig && selectedMeta && (
        <div className={cn(
          "rounded-xl border-2 p-4 space-y-3 transition-all",
          (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).border,
          (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).bgSelected,
        )}>
          {/* Hệ thống chính trị */}
          <div className="flex items-start gap-2.5">
            <ShieldCheck className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Hệ thống</p>
              <p className="text-xs mt-0.5 font-semibold">
                {POLITICAL_SYSTEM_LABEL[selectedConfig.politicalSystem].label}
              </p>
            </div>
          </div>

          {/* Quyền ký ban hành */}
          <div className="flex items-start gap-2.5">
            <Scale className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Quyền ký ban hành</p>
              <p className="text-xs mt-0.5">{selectedConfig.signingNote}</p>
            </div>
          </div>

          {/* Nhiệm vụ đặc thù */}
          <div className="flex items-start gap-2.5">
            <Network className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Nhiệm vụ</p>
              <p className="text-xs mt-0.5">{selectedConfig.purposeNote}</p>
            </div>
          </div>

          {/* Chức danh lãnh đạo áp dụng */}
          <div className="flex items-start gap-2.5">
            <UserCheck className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Chức danh lãnh đạo</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedConfig.leaderTitleKeywords.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-current/30">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Trường bổ sung cần thu thập */}
          {selectedConfig.requiredFields.length > 0 && (
            <div className="flex items-start gap-2.5">
              <ClipboardList className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Thông tin cần bổ sung</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedConfig.requiredFields.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                      {f === "domainIds" && "Lĩnh vực chuyên môn"}
                      {f === "geographicAreaIds" && "Phạm vi địa lý"}
                      {f === "scope" && "Phạm vi nhiệm vụ"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
