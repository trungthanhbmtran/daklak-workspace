"use client";

import { Check, ShieldCheck } from "lucide-react";
import { Text } from "@/components/ui/typography";

export function EmployeeSystemSyncCard() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-slate-50 p-5 shadow-xs space-y-3 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0 shadow-2xs">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-900 truncate">
          Liên thông & Tích hợp Dữ liệu
        </span>
      </div>
      <Text variant="small" className="text-xs leading-relaxed text-slate-600 break-words">
        Hồ sơ nhân sự sau khi tạo sẽ được liên kết trực tiếp với <strong>Trục liên thông văn bản (LGSP)</strong>, hệ thống định danh người dùng <strong>user-service</strong> và cơ chế phân quyền dựa trên chính sách <strong>PBAC</strong> của tỉnh Đắk Lắk.
      </Text>
      <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-slate-500 flex-wrap">
        <span className="flex items-center gap-1 shrink-0">
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Tự động đồng bộ VTVL
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Check className="h-3.5 w-3.5 text-emerald-600" /> Chuẩn hóa Nghị định 30
        </span>
      </div>
    </div>
  );
}
