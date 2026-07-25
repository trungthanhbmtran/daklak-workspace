import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, History, Plus } from "lucide-react";

export function ProcessingHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl text-amber-600 shadow-sm">
            <Clock className="h-8 w-8" />
          </div>
          Văn bản Đang xử lý
        </h2>
        <p className="text-muted-foreground font-medium pl-14">
          Theo dõi tiến độ và xử lý các văn bản trong quy trình nghiệp vụ.
        </p>
      </div>
      <div className="flex gap-3 w-full md:w-auto">
        <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl border-muted-foreground/20 font-bold bg-background/50" iconStart={<History className="h-4 w-4" />}>Nhật ký xử lý</Button>
        <Button className="flex-1 md:flex-none h-12 rounded-xl shadow-xl shadow-primary/20 bg-primary font-bold px-6" iconStart={<Plus className="h-4 w-4" />}>Tạo dự thảo mới</Button>
      </div>
    </div>
  );
}
