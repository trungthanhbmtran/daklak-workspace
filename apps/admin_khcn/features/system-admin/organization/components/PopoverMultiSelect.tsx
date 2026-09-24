import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type MultiSelectItem = { id: number; name: string; code?: string };

type PopoverMultiSelectProps = {
  title: string;
  icon?: React.ReactNode;
  items: MultiSelectItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholderSearch?: string;
  triggerLabel?: React.ReactNode;
  isLoading?: boolean;
  /** Giá trị search từ server (chế độ async). */
  search?: string;
  /** Truyền prop này để bật chế độ async (search phía server). */
  onSearchChange?: (val: string) => void;
  /** Độ trễ (ms) trước khi gọi onSearchChange. Mặc định 300ms. */
  debounceMs?: number;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
};

/** Bỏ dấu tiếng Việt + lowercase để tìm kiếm không phân biệt dấu. */
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/* -------------------------------------------------------------------------- */
/*  Row: memo để toggle 1 item không làm re-render cả danh sách               */
/* -------------------------------------------------------------------------- */

type OptionItemProps = {
  item: MultiSelectItem;
  isSelected: boolean;
  onToggle: (id: number) => void;
};

const OptionItem = memo(function OptionItem({
  item,
  isSelected,
  onToggle,
}: OptionItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      role="option"
      aria-selected={isSelected}
      onClick={() => onToggle(item.id)}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors h-auto font-normal justify-start",
        isSelected ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted",
      )}
    >
      <div
        className={cn(
          "flex h-4 w-4 mt-0.5 shrink-0 items-center justify-center rounded-sm border",
          isSelected
            ? "bg-primary border-primary text-primary-foreground"
            : "border-input opacity-50 bg-background",
        )}
      >
        <Check className={cn("h-3 w-3", !isSelected && "opacity-0")} />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={cn(
            "text-sm font-medium whitespace-normal break-words",
            isSelected ? "text-primary" : "text-foreground",
          )}
        >
          {item.name}
        </span>
        {item.code && (
          <span className="text-xs text-muted-foreground truncate mt-0.5">
            {item.code}
          </span>
        )}
      </div>
    </Button>
  );
});

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

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
  debounceMs = 300,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: PopoverMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(search ?? "");

  const isAsync = onSearchChange !== undefined;

  /* ---------------------------- Search (debounce) --------------------------- */

  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emittedRef = useRef(search ?? "");

  // Đồng bộ khi parent đổi `search` từ bên ngoài (ví dụ reset filter)
  useEffect(() => {
    if (!isAsync) return;
    const next = search ?? "";
    if (next !== emittedRef.current) {
      emittedRef.current = next;
      setInputValue(next);
    }
  }, [search, isAsync]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const emitSearch = useCallback(
    (val: string) => {
      emittedRef.current = val;
      onSearchChange?.(val);
    },
    [onSearchChange],
  );

  const handleSearchChange = useCallback(
    (val: string) => {
      setInputValue(val);
      if (!onSearchChange) return;
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => emitSearch(val), debounceMs);
    },
    [onSearchChange, emitSearch, debounceMs],
  );

  const handleClearSearch = useCallback(() => {
    setInputValue("");
    if (onSearchChange) {
      clearTimeout(timerRef.current);
      emitSearch("");
    }
  }, [onSearchChange, emitSearch]);

  /* ------------------------------ Selection -------------------------------- */

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  // Giữ ref tới giá trị mới nhất để `toggleItem` có identity ổn định
  // => OptionItem (memo) không bị re-render thừa.
  const latest = useRef({ selectedIds, onChange });
  latest.current = { selectedIds, onChange };

  const toggleItem = useCallback((id: number) => {
    const { selectedIds, onChange } = latest.current;
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((v) => v !== id)
        : [...selectedIds, id],
    );
  }, []);

  const removeAll = useCallback(() => latest.current.onChange([]), []);

  /**
   * Cache các item đã từng xuất hiện. Ở chế độ async, khi search/phân trang
   * làm `items` thay đổi, các item đã chọn không còn trong danh sách hiện tại
   * nhưng vẫn phải hiển thị ở khu vực "Đã chọn".
   */
  const knownItemsRef = useRef(new Map<number, MultiSelectItem>());

  const selectedItems = useMemo(() => {
    const known = knownItemsRef.current;
    for (const item of items) known.set(item.id, item);
    return selectedIds
      .map((id) => known.get(id))
      .filter((i): i is MultiSelectItem => i !== undefined);
  }, [items, selectedIds]);

  /* ------------------------- Client-side filtering ------------------------- */

  // Chuẩn hoá 1 lần khi `items` đổi, không chuẩn hoá lại mỗi lần gõ phím
  const indexedItems = useMemo(
    () =>
      isAsync
        ? []
        : items.map((item) => ({
          item,
          key: normalize(`${item.name} ${item.code ?? ""}`),
        })),
    [items, isAsync],
  );

  // Giữ ô input mượt khi danh sách lớn
  const deferredQuery = useDeferredValue(inputValue);

  const displayItems = useMemo(() => {
    if (isAsync) return items;
    const q = normalize(deferredQuery.trim());
    if (!q) return items;
    return indexedItems.filter((x) => x.key.includes(q)).map((x) => x.item);
  }, [isAsync, items, indexedItems, deferredQuery]);

  /* -------------------------------- Handlers -------------------------------- */

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      // Chế độ local: reset ô tìm kiếm khi đóng
      if (!next && !onSearchChange) setInputValue("");
    },
    [onSearchChange],
  );

  const showInitialLoading = isLoading && displayItems.length === 0;
  const showRefetching = isLoading && displayItems.length > 0;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between font-normal bg-background hover:bg-muted/50 border-input h-auto min-h-11 py-2 shadow-sm text-left"
        >
          <span className="flex items-center gap-2 truncate text-muted-foreground font-medium">
            {icon && <span className="shrink-0">{icon}</span>}
            <span className="truncate">{triggerLabel}</span>
          </span>
          {selectedIds.length > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-primary/10 text-primary shrink-0"
            >
              {selectedIds.length} đã chọn
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[350px] sm:w-[500px] max-h-[500px] flex flex-col p-0 overflow-hidden border-primary/20 gap-0 bg-background shadow-lg"
        align="start"
        sideOffset={5}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b shrink-0 bg-muted/10">
          <div className="flex items-center gap-2 text-primary text-base font-semibold">
            {icon && <span>{icon}</span>}
            {title}
          </div>
        </div>

        {/* Selected chips */}
        {selectedItems.length > 0 && (
          <div className="shrink-0 px-5 py-3 border-b bg-primary/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">
                Đã chọn ({selectedIds.length})
              </span>
              <button
                type="button"
                onClick={removeAll}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-background text-foreground text-xs font-medium border shadow-sm"
                >
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  <button
                    type="button"
                    aria-label={`Bỏ chọn ${item.name}`}
                    onClick={() => toggleItem(item.id)}
                    className="rounded-full p-0.5 hover:bg-destructive hover:text-destructive-foreground transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="shrink-0 p-4 border-b relative">
          <Search className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholderSearch}
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10 h-10 bg-muted/30"
          />
          {inputValue ? (
            <button
              type="button"
              aria-label="Xóa nội dung tìm kiếm"
              onClick={handleClearSearch}
              className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          ) : (
            showRefetching && (
              <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )
          )}
        </div>

        {/* List: dùng div native thay ScrollArea để max-h hoạt động đúng và nhẹ hơn */}
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label={title}
          className="max-h-[300px] overflow-y-auto overscroll-contain bg-background p-2 space-y-0.5 custom-scrollbar"
        >
          {showInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Đang tải dữ liệu...</span>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <p className="text-sm">Không tìm thấy kết quả phù hợp.</p>
            </div>
          ) : (
            displayItems.map((item) => (
              <OptionItem
                key={item.id}
                item={item}
                isSelected={selectedSet.has(item.id)}
                onToggle={toggleItem}
              />
            ))
          )}

          {/* Load more */}
          {hasNextPage && fetchNextPage && (
            <div className="pt-4 pb-2 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium text-primary border-primary/20 hover:bg-primary/5"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  "Tải thêm kết quả..."
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}