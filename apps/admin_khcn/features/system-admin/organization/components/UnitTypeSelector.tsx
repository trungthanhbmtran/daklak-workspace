"use client";

import {
  Landmark, Flag, BookOpen, GraduationCap, Users,
  Building2, ClipboardList, RefreshCw, CheckCircle2,
  ShieldCheck, Scale, Network, UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { Button } from "@/components/ui/button";
import {
  UNIT_TYPE_CATEGORY_GROUP,
  parseUnitTypeCategoryMeta,
  SIGNING_AUTHORITY_LABEL,
  POLITICAL_SYSTEM_LABEL,
} from "../hooks/useUnitTypeCategories";

// ── Icon map (server trả tên string) ─────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Landmark, Flag, BookOpen, GraduationCap, Users,
  Building2, ClipboardList, ShieldCheck, Scale,
};

// ── Color map (server trả màu string) ────────────────────────────────────────
const COLOR_MAP: Record<string, {
  border: string; bg: string; bgSelected: string;
  icon: string; text: string; badge: string; badgeBg: string;
}> = {
  blue:    { border:"border-blue-400",    bg:"bg-blue-50/60",    bgSelected:"bg-blue-100",    icon:"text-blue-500",    text:"text-blue-800",    badge:"text-blue-700",    badgeBg:"bg-blue-100"    },
  red:     { border:"border-red-400",     bg:"bg-red-50/60",     bgSelected:"bg-red-100",     icon:"text-red-500",     text:"text-red-800",     badge:"text-red-700",     badgeBg:"bg-red-100"     },
  violet:  { border:"border-violet-400",  bg:"bg-violet-50/60",  bgSelected:"bg-violet-100",  icon:"text-violet-500",  text:"text-violet-800",  badge:"text-violet-700",  badgeBg:"bg-violet-100"  },
  emerald: { border:"border-emerald-400", bg:"bg-emerald-50/60", bgSelected:"bg-emerald-100", icon:"text-emerald-500", text:"text-emerald-800", badge:"text-emerald-700", badgeBg:"bg-emerald-100" },
  amber:   { border:"border-amber-400",   bg:"bg-amber-50/60",   bgSelected:"bg-amber-100",   icon:"text-amber-500",   text:"text-amber-800",   badge:"text-amber-700",   badgeBg:"bg-amber-100"   },
  slate:   { border:"border-slate-400",   bg:"bg-slate-50/60",   bgSelected:"bg-slate-100",   icon:"text-slate-500",   text:"text-slate-800",   badge:"text-slate-700",   badgeBg:"bg-slate-100"   },
};
const DEFAULT_C = COLOR_MAP["slate"];

interface UnitTypeSelectorProps {
  /** categoryCode đang chọn: "CHINH_QUYEN" | "DANG" | "THAM_MUU" | ... */
  value: string;
  onChange: (categoryCode: string) => void;
  disabled?: boolean;
}

/**
 * UnitTypeSelector — bộ chọn phân loại tổ chức.
 *
 * Toàn bộ metadata (signingNote, purposeNote, requiredFields, leaderTitleKeywords...)
 * đến từ server qua /categories?group=UNIT_TYPE_CATEGORY.
 * Frontend chỉ parse description JSON và render — không hardcode logic nghiệp vụ.
 */
export function UnitTypeSelector({ value, onChange, disabled }: UnitTypeSelectorProps) {
  const { data: items = [], isLoading, isError, refetch } = useGetCategoryByGroup(
    UNIT_TYPE_CATEGORY_GROUP
  );

  const sorted = [...items].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const selectedItem = sorted.find((i) => i.code === value);
  const selectedMeta = selectedItem ? parseUnitTypeCategoryMeta(selectedItem) : null;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  // ── Error / empty ─────────────────────────────────────────────────────────
  if (isError || items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 border rounded-xl bg-muted/10 text-center px-4">
        <Building2 className="h-7 w-7 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">
          {isError ? "Không tải được danh mục phân loại." : "Chưa có danh mục phân loại."}
        </p>
        <Button type="button" onClick={() => refetch()}
          className="flex items-center gap-1 text-xs text-primary hover:underline">
          <RefreshCw className="h-3 w-3" /> Thử lại
        </Button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-3", disabled && "opacity-50 pointer-events-none")}>

      {/* GRID — 6 card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sorted.map((item) => {
          const meta = parseUnitTypeCategoryMeta(item);
          const Icon = ICON_MAP[meta.icon] ?? Building2;
          const c = COLOR_MAP[meta.color] ?? DEFAULT_C;
          const isSelected = value === item.code;

          return (
            <Button
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
              {isSelected && (
                <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 shrink-0" />
              )}

              <div className={cn(
                "mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                isSelected ? "bg-white/60" : "bg-white/40"
              )}>
                <Icon className={cn("h-4 w-4", c.icon)} />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[13px] font-bold leading-tight line-clamp-1">{item.name}</p>
                {meta.description && (
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 font-normal">
                    {meta.description}
                  </p>
                )}
                {/* Badge quyền ký — từ server */}
                {meta.signingAuthority && (
                  <span className={cn(
                    "inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5",
                    c.badgeBg, c.badge
                  )}>
                    {SIGNING_AUTHORITY_LABEL[meta.signingAuthority]?.label}
                  </span>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* PANEL CHI TIẾT — chỉ hiện khi đã chọn, data từ server */}
      {value && selectedMeta && (
        <div className={cn(
          "rounded-xl border-2 p-4 space-y-3 transition-all",
          (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).border,
          (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).bgSelected,
        )}>
          {/* Hệ thống chính trị */}
          {selectedMeta.politicalSystem && (
            <div className="flex items-start gap-2.5">
              <ShieldCheck className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Hệ thống</p>
                <p className="text-xs mt-0.5 font-semibold">
                  {POLITICAL_SYSTEM_LABEL[selectedMeta.politicalSystem]?.label}
                </p>
              </div>
            </div>
          )}

          {/* Quyền ký */}
          {selectedMeta.signingNote && (
            <div className="flex items-start gap-2.5">
              <Scale className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Quyền ký ban hành</p>
                <p className="text-xs mt-0.5">{selectedMeta.signingNote}</p>
              </div>
            </div>
          )}

          {/* Nhiệm vụ */}
          {selectedMeta.purposeNote && (
            <div className="flex items-start gap-2.5">
              <Network className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Nhiệm vụ</p>
                <p className="text-xs mt-0.5">{selectedMeta.purposeNote}</p>
              </div>
            </div>
          )}

          {/* Chức danh lãnh đạo */}
          {selectedMeta.leaderTitleKeywords.length > 0 && (
            <div className="flex items-start gap-2.5">
              <UserCheck className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Chức danh lãnh đạo</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMeta.leaderTitleKeywords.map((t) => (
                    <Badge key={t} variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-current/30">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trường bổ sung */}
          {selectedMeta.requiredFields.length > 0 && (
            <div className="flex items-start gap-2.5">
              <ClipboardList className={cn("h-4 w-4 mt-0.5 shrink-0", (COLOR_MAP[selectedMeta.color] ?? DEFAULT_C).icon)} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Thông tin cần bổ sung</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedMeta.requiredFields.map((f) => (
                    <Badge key={f} variant="secondary" className="text-[10px] h-5 px-1.5 font-semibold">
                      {f === "domainIds" && "Lĩnh vực chuyên môn"}
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
