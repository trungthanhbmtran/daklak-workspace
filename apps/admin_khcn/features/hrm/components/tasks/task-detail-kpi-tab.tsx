/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Heading, Text } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { safeFormatDate } from "./task-ui-utils";

interface TaskKpiTabProps {
  taskId: number;
  currentTask: any;
  canEvaluate: boolean;
  onOpenEvaluation?: () => void;
}

export function TaskKpiTab({ taskId, currentTask, canEvaluate, onOpenEvaluation }: TaskKpiTabProps) {
  const evalData = currentTask?.metadata?.evaluation || {};
  const kpiData = currentTask?.kpi || {};
  const hasEvaluation = Boolean(currentTask?.kpi || currentTask?.metadata?.evaluation);

  const total = evalData.totalScore ?? kpiData.totalScore ?? 0;
  const rank = evalData.rankGrade ?? kpiData.qualityGrade ?? "HOÀN THÀNH";

  if (hasEvaluation) {
    return (
      <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs min-w-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <Heading level="h4" className="font-bold text-base text-indigo-950">
                Phiếu Thẩm định & Điểm số KPI Công vụ
              </Heading>
              <span className="text-xs text-slate-500">Quy định thẩm định 4 thành tố Đề án 01-BTCTU</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1 shadow-2xs">
              {rank}
            </Badge>
            {canEvaluate && onOpenEvaluation && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenEvaluation}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold h-8 px-3"
              >
                <Award className="w-3.5 h-3.5 mr-1" />
                Đánh giá lại
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <Text variant="small" className="text-slate-500 mb-1 font-normal">Tổng điểm nhiệm vụ</Text>
              <div className="text-3xl font-bold font-mono text-indigo-700">
                {total} <span className="text-sm font-normal text-slate-400">/ 100đ</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Xếp loại công vụ</span>
              <span className="font-bold text-sm text-emerald-700">{rank}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex flex-col justify-between">
            <Text variant="small" className="text-slate-500 mb-1 font-normal">Thời điểm phê duyệt</Text>
            <p className="font-semibold text-slate-800 text-sm">
              {safeFormatDate(evalData.evaluatedAt || kpiData.evaluatedAt || currentTask.updatedAt, "dd/MM/yyyy HH:mm")}
            </p>
            <span className="text-[11px] text-slate-500 mt-1">
              Người thẩm định: <strong>{currentTask.supervisorName || currentTask.supervisorCode || "Lãnh đạo phụ trách"}</strong>
            </span>
          </div>

          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
            <span className="text-blue-900/80 block text-xs font-medium">A. Khối lượng công việc (35%):</span>
            <div className="text-blue-700 text-base font-bold mt-1">
              {evalData.volumePct ?? 100}% <span className="text-xs font-normal text-blue-600">(Hệ số K={evalData.difficultyK ?? 1.0})</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
            <span className="text-emerald-900/80 block text-xs font-medium">B. Chất lượng sản phẩm (35%):</span>
            <div className="text-emerald-700 text-base font-bold mt-1">
              {evalData.qualityScore ?? kpiData.qualityScore ?? 100} điểm
            </div>
          </div>

          <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-100">
            <span className="text-purple-900/80 block text-xs font-medium">C. Tiến độ giải quyết (20%):</span>
            <div className="text-purple-700 text-base font-bold mt-1">
              {evalData.timelinessScore ?? kpiData.timelinessScore ?? 100} điểm
            </div>
          </div>

          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100">
            <span className="text-amber-900/80 block text-xs font-medium">D. Thái độ & Trách nhiệm (10%):</span>
            <div className="text-amber-700 text-base font-bold mt-1">
              {evalData.attitudeScore ?? 10} / 10 điểm
            </div>
          </div>

          {(evalData.feedback || kpiData.note) && (
            <div className="col-span-1 md:col-span-2 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <Text variant="small" className="text-indigo-950 font-semibold mb-1 text-xs">
                Ý kiến chỉ đạo & Nhận xét của Lãnh đạo thẩm định:
              </Text>
              <p className="text-slate-700 italic wrap-break-word leading-relaxed text-xs">
                &ldquo;{evalData.feedback || kpiData.note}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Bảng Tiêu chuẩn KPI Dự kiến theo VTVL */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 min-w-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <Heading level="h4" className="font-bold text-base text-slate-900">
                Cấu hình & Tiêu chuẩn Tính điểm KPI
              </Heading>
              <span className="text-xs text-slate-400">Cơ chế định biên VTVL Đề án 01 - BTCTU</span>
            </div>
          </div>
          <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200 text-xs">
            Chờ thẩm định
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Thang điểm cơ sở:</span>
            <strong className="text-slate-800 text-base font-mono">100 điểm</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Trọng số nhiệm vụ:</span>
            <strong className="text-slate-800 text-base font-mono">x{currentTask?.weight || 1}</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Độ phức tạp (K):</span>
            <strong className="text-slate-800 text-base font-mono">
              K = {currentTask?.metadata?.difficultyK || 1.0}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Lãnh đạo thẩm định:</span>
            <strong className="text-slate-800 text-xs truncate block mt-0.5">
              {currentTask?.supervisorName || currentTask?.supervisorCode || "Theo phân công VTVL"}
            </strong>
          </div>
        </div>
      </div>

      {/* Banner hướng dẫn thẩm định */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">
              Chưa có kết quả thẩm định chính thức
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Điểm KPI sẽ được chốt sau khi Lãnh đạo thẩm định 4 thành tố (Khối lượng, Chất lượng, Tiến độ, Thái độ)
            </p>
          </div>
        </div>

        {canEvaluate && onOpenEvaluation && (
          <Button
            size="sm"
            onClick={onOpenEvaluation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-8 px-4 shrink-0 shadow-xs"
          >
            <Award className="w-3.5 h-3.5 mr-1.5" />
            Mở Thẩm định ngay
          </Button>
        )}
      </div>
    </div>
  );
}
