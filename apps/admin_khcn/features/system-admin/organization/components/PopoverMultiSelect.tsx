import { useState, useMemo } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type PopoverMultiSelectProps = {
  title: string;
  icon?: React.ReactNode;
  items: { id: number; name: string; code?: string }[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholderSearch?: string;
  triggerLabel?: React.ReactNode;
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (val: string) => void;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
};

export function PopoverMultiSelect({
  title,
  icon,
  items,
  selectedIds,
  onChange,
  placeholderSearch = "Tìm kiếm...",
  triggerLabel = "Chọn mục",
  isLoading = false,
  search,
  onSearchChange,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: PopoverMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const isAsync = onSearchChange !== undefined;
  
  // Dùng search server (search) nếu có, không thì dùng localSearch
  const currentSearch = isAsync ? (search || "") : localSearch;

  const handleSearchChange = (val: string) => {
    if (isAsync && onSearchChange) {
      onSearchChange(val);
    } else {
      setLocalSearch(val);
    }
  };

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeAll = () => onChange([]);

  // Client-side filtering if not async
  const displayItems = useMemo(() => {
    if (isAsync) return items;
    if (!localSearch.trim()) return items;
    const lowerQ = localSearch.toLowerCase();
    return items.filter(
      (i) => i.name.toLowerCase().includes(lowerQ) || i.code?.toLowerCase().includes(lowerQ)
    );
  }, [items, isAsync, localSearch]);

  const selectedItems = useMemo(() => {
    return items.filter(i => selectedIds.includes(i.id));
  }, [items, selectedIds]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal bg-background hover:bg-muted/50 border-input h-auto min-h-11 py-2 shadow-sm text-left"
        >
          <span className="flex items-center gap-2 truncate text-muted-foreground font-medium">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="truncate">{triggerLabel}</span>
          </span>
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary shrink-0">
              {selectedIds.length} đã chọn
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[600px] h-[85vh] flex flex-col p-0 overflow-hidden shadow-xl border-primary/20 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0 bg-muted/10">
          <DialogTitle className="flex items-center gap-2 text-primary text-base">
            {icon && <span>{icon}</span>}
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Selected Chips Area */}
        {selectedItems.length > 0 && (
          <div className="shrink-0 px-5 py-3 border-b bg-primary/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">Đã chọn ({selectedIds.length})</span>
              <Button 
                onClick={removeAll}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Xóa tất cả
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-background text-foreground text-xs font-medium border shadow-sm"
                >
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  <Button
                    onClick={() => toggleItem(item.id)}
                    className="rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="shrink-0 p-4 border-b relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={placeholderSearch}
            value={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-10 bg-muted/30"
          />
          {currentSearch && (
            <Button
              onClick={() => handleSearchChange("")}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* List Content */}
        <ScrollArea className="flex-1 min-h-0 bg-background px-2">
          <div className="p-2 space-y-0.5">
            {isLoading && displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Đang tải dữ liệu...</span>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <p className="text-sm">Không tìm thấy kết quả phù hợp.</p>
              </div>
            ) : (
              displayItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <Button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                      isSelected ? "bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input opacity-50"
                      )}
                    >
                      <Check className={cn("h-3 w-3", !isSelected && "opacity-0")} />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className={cn("text-sm font-medium truncate", isSelected ? "text-primary" : "text-foreground")}>
                        {item.name}
                      </span>
                      {item.code && (
                        <span className="text-xs text-muted-foreground truncate">{item.code}</span>
                      )}
                    </div>
                  </Button>
                );
              })
            )}

            {/* Pagination / Load More */}
            {hasNextPage && fetchNextPage && (
              <div className="pt-4 pb-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium text-primary border-primary/20 hover:bg-primary/5"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Đang tải...</>
                  ) : (
                    "Tải thêm kết quả..."
                  )}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Footer Actions */}
        <div className="shrink-0 p-4 border-t bg-muted/10 flex justify-end">
          <Button onClick={() => setOpen(false)} className="px-6">
            Xong
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
