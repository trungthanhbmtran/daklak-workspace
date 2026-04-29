"use client";

import { memo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchFilterProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
  rightContent?: React.ReactNode;
}

const SearchFilter = ({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  onFilterClick,
  rightContent
}: SearchFilterProps) => {
  return (
    <div className="p-5 border-b bg-background flex flex-wrap gap-4 items-center">
      <div className="relative flex-1 min-w-[300px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-11 h-12 bg-muted/20 border-none rounded-2xl focus-visible:ring-blue-500/20 font-medium transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-3">
        {onFilterClick && (
          <Button 
            variant="outline" 
            onClick={onFilterClick}
            className="h-12 rounded-2xl border-dashed border-2 hover:bg-muted/10 transition-all active:scale-95"
          >
            <Filter className="h-4 w-4 mr-2" /> Bộ lọc
          </Button>
        )}
        {rightContent}
      </div>
    </div>
  );
};

export default memo(SearchFilter);
