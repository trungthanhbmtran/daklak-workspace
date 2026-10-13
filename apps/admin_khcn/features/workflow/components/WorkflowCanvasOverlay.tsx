"use client";

import { memo } from "react";
import { useViewport } from "@xyflow/react";
import type { WorkflowPhase } from "@/features/workflow/api";
import type { CanvasNode } from "../utils/workflow-graph-utils";

interface PhaseColorTheme {
  border: string;
  bg: string;
  text: string;
  badge: string;
  icon: string;
}

const PHASE_THEMES: PhaseColorTheme[] = [
  {
    border: "border-emerald-400/60 dark:border-emerald-500/40",
    bg: "bg-emerald-500/[0.04] dark:bg-emerald-950/[0.12]",
    text: "text-emerald-800 dark:text-emerald-300",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/60",
    icon: "🟢",
  },
  {
    border: "border-blue-400/60 dark:border-blue-500/40",
    bg: "bg-blue-500/[0.04] dark:bg-blue-950/[0.12]",
    text: "text-blue-800 dark:text-blue-300",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/60",
    icon: "🔵",
  },
  {
    border: "border-amber-400/60 dark:border-amber-500/40",
    bg: "bg-amber-500/[0.04] dark:bg-amber-950/[0.12]",
    text: "text-amber-800 dark:text-amber-300",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/60",
    icon: "⚖️",
  },
  {
    border: "border-purple-400/60 dark:border-purple-500/40",
    bg: "bg-purple-500/[0.04] dark:bg-purple-950/[0.12]",
    text: "text-purple-800 dark:text-purple-300",
    badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/60",
    icon: "🟣",
  },
];

export const WorkflowCanvasOverlay = memo(function WorkflowCanvasOverlay({
  workflowCode,
  workflowName,
  phases,
  nodes,
}: {
  workflowCode?: string;
  workflowName?: string;
  phases: WorkflowPhase[];
  nodes: CanvasNode[];
}) {
  const { x, y, zoom } = useViewport();
  const searchKey = `${workflowCode || ""} ${workflowName || ""}`.toUpperCase();

  const isBtctuTaskManagement =
    searchKey.includes("QUAN_LY_CONG_VIEC") ||
    searchKey.includes("TASK_MANAGEMENT") ||
    searchKey.includes("QUẢN LÝ CÔNG VIỆC");

  if (!isBtctuTaskManagement && phases.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible select-none z-0"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${zoom})`,
        transformOrigin: "0 0",
        willChange: "transform",
        contain: "paint layout",
      }}
    >
      {/* TRƯỜNG HỢP 1: QUY TRÌNH QUẢN LÝ CÔNG VIỆC (4 SWIMLANES THEO THẨM QUYỀN) */}
      {isBtctuTaskManagement && phases.length === 0 && (
        <>
          {/* LÀN 1: BAN THƯỜNG VỤ TỈNH ỦY */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-purple-400/50 bg-purple-500/[0.04] dark:border-purple-600/40 dark:bg-purple-950/[0.12]"
            style={{ left: 20, top: 20, width: 2900, height: 190 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-purple-800 dark:text-purple-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-purple-500/20 text-[11px]">🏛️</span>
              <span>LÀN 1: BAN THƯỜNG VỤ TỈNH ỦY / THƯỜNG TRỰC TỈNH ỦY</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Giao nhiệm vụ, phê duyệt chủ trương, đề án & ban hành kết luận
              </span>
            </div>
          </div>

          {/* LÀN 2: LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-rose-400/50 bg-rose-500/[0.04] dark:border-rose-600/40 dark:bg-rose-950/[0.12]"
            style={{ left: 20, top: 230, width: 2900, height: 230 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-rose-800 dark:text-rose-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-[11px]">🔴</span>
              <span>LÀN 2: LÃNH ĐẠO BAN TỔ CHỨC TỈNH ỦY (Trưởng ban & 4 Phó ban)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Tiếp nhận chỉ đạo, phân công cấp Phòng, thẩm định Tờ trình, ký số CA & tự động tính KPI
              </span>
            </div>
          </div>

          {/* LÀN 3: LÃNH ĐẠO PHÒNG CHUYÊN MÔN */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-blue-400/50 bg-blue-500/[0.04] dark:border-blue-600/40 dark:bg-blue-950/[0.12]"
            style={{ left: 20, top: 480, width: 2900, height: 210 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-blue-800 dark:text-blue-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-blue-500/20 text-[11px]">🔵</span>
              <span>LÀN 3: LÃNH ĐẠO PHÒNG CHUYÊN MÔN (Trưởng / Phó 05 Phòng)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Phân rã việc, gán hệ số K & trọng số A/B/C/D, kiểm soát 3 mức lỗi, ký nháy Tờ trình
              </span>
            </div>
          </div>

          {/* LÀN 4: CHUYÊN VIÊN NGHIỆP VỤ 22 VTVL */}
          <div
            className="absolute rounded-2xl border-2 border-dashed border-emerald-400/50 bg-emerald-500/[0.04] dark:border-emerald-600/40 dark:bg-emerald-950/[0.12]"
            style={{ left: 20, top: 710, width: 2900, height: 200 }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wide text-emerald-800 dark:text-emerald-300">
              <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-[11px]">🟢</span>
              <span>LÀN 4: CHUYÊN VIÊN NGHIỆP VỤ (22 Vị trí việc làm & Người phối hợp)</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                — Thực thi chuyên môn (TCCB Mẫu 2C, TCĐ-ĐV LGSP, BVCTNB Mức 3, Văn phòng ATTT Cấp 3), nộp minh chứng
              </span>
            </div>
          </div>
        </>
      )}

      {/* TRƯỜNG HỢP 2: CÁC ĐỢT / GIAI ĐOẠN ĐỘNG DỰA TRÊN PHASES (DYNAMIC BOUNDING BOXES THEMED CHUẨN XÁC) */}
      {phases.map((phase, index) => {
        const phaseNodes = nodes.filter((node) => node.data?.phaseId === phase.id);
        if (!phaseNodes.length) return null;

        const theme = PHASE_THEMES[index % PHASE_THEMES.length];
        const left = Math.min(...phaseNodes.map((node) => node.position.x)) - 36;
        const top = Math.min(...phaseNodes.map((node) => node.position.y)) - 56;
        const right = Math.max(...phaseNodes.map((node) => node.position.x)) + 280;
        const bottom = Math.max(...phaseNodes.map((node) => node.position.y)) + 160;
        const width = Math.max(340, right - left + 36);
        const height = Math.max(220, bottom - top + 36);

        return (
          <div
            key={phase.id}
            className={`absolute rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} transition-all`}
            style={{ left, top, width, height }}
          >
            <div className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold tracking-wide ${theme.text}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-background/80 shadow-xs text-[11px]">
                  {theme.icon}
                </span>
                <span className="truncate uppercase font-bold">
                  GIAI ĐOẠN {index + 1}: {phase.name}
                </span>
                <span className="hidden sm:inline text-[11px] font-normal text-muted-foreground">
                  ({phaseNodes.length} bước thực hiện)
                </span>
              </div>
              {phase.description && (
                <span className="truncate text-[10px] font-normal text-muted-foreground max-w-sm">
                  — {phase.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});
