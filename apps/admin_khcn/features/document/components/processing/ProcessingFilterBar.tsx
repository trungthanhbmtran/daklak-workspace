import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Filter } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Props {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function ProcessingFilterBar({ statusFilter, setStatusFilter }: Props) {
  return (
    <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
      <Search placeholder="Tìm theo trích yếu, người xử lý, bước hiện tại..." className="flex-1 min-w-[300px]" />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px] h-12 rounded-2xl border-none bg-muted/20 font-bold">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-none shadow-2xl">
          <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
          <SelectItem value="PROCESSING">Đang xử lý</SelectItem>
          <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
          <SelectItem value="OVERDUE">Quá hạn</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10 font-bold" iconStart={<Filter className="h-4 w-4" />}>Lọc thêm</Button>
    </div>
  );
}
