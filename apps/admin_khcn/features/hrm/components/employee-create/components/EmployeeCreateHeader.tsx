"use client";

import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/typography";

interface EmployeeCreateHeaderProps {
  isSubmitting: boolean;
  isUploading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function EmployeeCreateHeader({
  isSubmitting,
  isUploading,
  onCancel,
  onSubmit,
}: EmployeeCreateHeaderProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCancel}
            className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shrink-0"
            title="Quay lại"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Badge
                variant="outline"
                className="text-[11px] font-semibold text-blue-700 bg-blue-50 border-blue-200 px-2 py-0.5 rounded-md shrink-0"
              >
                HRM & KPI VTVL
              </Badge>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-500 font-medium truncate">Thêm mới nhân sự</span>
            </div>
            <Heading
              level="h3"
              className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate flex items-center gap-2 mt-0.5"
            >
              Tạo mới Hồ sơ Cán bộ & Vị trí việc làm
            </Heading>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 px-4 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-sm"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isUploading}
            className="h-9 px-5 font-semibold rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white shadow-sm shadow-blue-500/20 text-sm gap-2 transition-all active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Lưu hồ sơ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
