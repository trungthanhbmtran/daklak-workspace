"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MultiSelectModalProps = {
  title: string;
  icon?: React.ReactNode;
  items: { id: number; name: string; code?: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholderSearch?: string;
  triggerLabel?: React.ReactNode;
  isLoading?: boolean;
};

export function MultiSelectModal({
  title,
  icon,
  items,
  selectedIds,
  onChange,
  placeholderSearch = "Tìm kiếm...",
  triggerLabel = "Chọn mục",
  isLoading = false,
}: MultiSelectModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectAll = () => {
    const visibleIds = filteredItems.map((i) => i.id);
    const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      onChange(selectedIds.filter((id) => !visibleIds.includes(id)));
    } else {
      const toAdd = visibleIds.filter((id) => !selectedIds.includes(id));
      onChange([...selectedIds, ...toAdd]);
    }
  };

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal bg-background hover:bg-muted/50 border-input h-auto min-h-11 py-2 shadow-sm">
          <span className="flex items-center gap-2 truncate text-muted-foreground font-medium">
            {icon && <span>{icon}</span>}
            <span>{triggerLabel}</span>
          </span>
          <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary shrink-0">
            {selectedIds.length} đã chọn
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b bg-slate-50/80">
          <DialogTitle className="flex items-center gap-2 text-lg text-slate-800">
            {icon && <span className="text-primary">{icon}</span>}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-col gap-4 flex-1 min-h-0 bg-slate-50/30">
          {/* Search Bar & Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={placeholderSearch}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 h-10 rounded-lg border border-input bg-white text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" onClick={toggleSelectAll} className="h-10 text-xs bg-white border shadow-sm">
                {filteredItems.every(i => selectedIds.includes(i.id)) && filteredItems.length > 0 ? "Bỏ chọn tất cả" : "Chọn tất cả hiển thị"}
              </Button>
              {selectedIds.length > 0 && (
                <Button variant="ghost" onClick={clearAll} className="h-10 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">
                  <X className="h-3.5 w-3.5 mr-1" /> Làm lại
                </Button>
              )}
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 min-h-[350px] border rounded-lg bg-white overflow-y-auto custom-scrollbar shadow-inner">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Đang tải dữ liệu...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground italic text-sm">
                Không tìm thấy kết quả phù hợp.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4">
                {filteredItems.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/40",
                        isChecked ? "bg-primary/5 border-primary/40 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground h-4 w-4"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={cn("text-sm truncate", isChecked ? "font-bold text-primary" : "font-medium text-slate-700")}>
                          {item.name}
                        </span>
                      </div>
                      {item.code && (
                        <Badge variant="outline" className="font-mono text-[10px] shrink-0 text-muted-foreground bg-slate-50 border-slate-200">
                          {item.code}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50/80 flex justify-end gap-3 shrink-0">
          <Button variant="default" onClick={() => setOpen(false)} className="px-8 font-bold shadow-sm">
            Hoàn tất chọn
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
