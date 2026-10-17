import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, History, Plus } from "lucide-react";

export function ProcessingHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-1">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-600 shadow-xs shrink-0">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          Văn bản Đang xử lý
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm font-medium sm:pl-12">
          Theo dõi tiến độ và xử lý các văn bản trong quy trình nghiệp vụ.
        </p>
      </div>
      <div className="flex gap-2.5 w-full md:w-auto">
        <Button variant="outline" size="sm" className="flex-1 md:flex-none h-9 rounded-xl border-muted-foreground/20 font-semibold bg-background/50 text-xs" iconStart={<History className="h-4 w-4" />}>Nhật ký xử lý</Button>
        <Button size="sm" className="flex-1 md:flex-none h-9 rounded-xl shadow-xs bg-primary font-semibold text-xs px-4" iconStart={<Plus className="h-4 w-4" />}>Tạo dự thảo mới</Button>
      </div>
    </div>
  );
}
