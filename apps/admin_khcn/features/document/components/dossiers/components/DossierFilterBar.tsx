import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DossierFilterBar() {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm mã hồ sơ, người nộp..."
          className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="rounded-full" iconStart={<Filter className="h-4 w-4" />}>Lọc Trạng thái</Button>
        <Button variant="secondary" size="sm" className="rounded-full bg-muted text-foreground hover:bg-muted/80">
          Đang xử lý
        </Button>
      </div>
    </div>
  );
}
