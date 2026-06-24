"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const isAsync = onSearchChange !== undefined;

  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((v) => v !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal bg-background hover:bg-muted/50 border-input h-auto min-h-11 py-2 shadow-sm"
        >
          <span className="flex items-center gap-2 truncate text-muted-foreground font-medium">
            {icon && <span>{icon}</span>}
            <span>{triggerLabel}</span>
          </span>
          {selectedIds.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary shrink-0">
              {selectedIds.length} đã chọn
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={!isAsync}>
          <CommandInput 
            placeholder={placeholderSearch} 
            value={search}
            onValueChange={onSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                "Không tìm thấy mục nào."
              )}
            </CommandEmpty>
            <CommandGroup heading={title}>
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => toggleItem(item.id)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <span>{item.name}</span>
                    {item.code && (
                      <span className="ml-auto text-xs text-muted-foreground">{item.code}</span>
                    )}
                  </CommandItem>
                );
              })}
              {hasNextPage && fetchNextPage && (
                <div className="pt-2 pb-1 flex justify-center border-t mt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs w-full text-primary hover:text-primary hover:bg-primary/5"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Đang tải...</>
                    ) : (
                      "Tải thêm kết quả"
                    )}
                  </Button>
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
