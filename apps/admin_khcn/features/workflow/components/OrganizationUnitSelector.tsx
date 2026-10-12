"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  FolderTree,
  Globe,
  Landmark,
  ListFilter,
  Search,
  X,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { OrganizationUnitNode } from "@/features/system-admin/organization/types";
import { toast } from "sonner";

export interface FlatUnitItem {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  categoryCode?: string;
  level: number;
  path: string[];
  pathString: string;
  searchIndex: string;
  rawNode: OrganizationUnitNode;
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function flattenUnitHierarchy(
  nodes: OrganizationUnitNode[],
  parentPath: string[] = [],
  level = 0
): FlatUnitItem[] {
  const result: FlatUnitItem[] = [];
  for (const node of nodes) {
    const currentPath = [...parentPath, node.name];
    if (node.code) {
      const pathStr = parentPath.join(" › ");
      const searchIndex = `${removeVietnameseTones(node.name)} ${node.code.toLowerCase()} ${removeVietnameseTones(node.shortName || "")} ${removeVietnameseTones(pathStr)}`;
      result.push({
        id: node.id,
        code: node.code,
        name: node.name,
        shortName: node.shortName,
        categoryCode: node.categoryCode,
        level,
        path: parentPath,
        pathString: pathStr,
        searchIndex,
        rawNode: node,
      });
    }
    const children = node.children ?? node.subordinateUnits ?? [];
    if (children.length > 0) {
      result.push(...flattenUnitHierarchy(children, currentPath, level + 1));
    }
  }
  return result;
}

export function getCategoryBadge(categoryCode?: string) {
  switch (categoryCode) {
    case "DANG":
      return { label: "Khối Đảng", variant: "default" as const, bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40" };
    case "CHINH_QUYEN":
      return { label: "Chính quyền", variant: "secondary" as const, bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40" };
    case "THAM_MUU":
      return { label: "Tham mưu", variant: "secondary" as const, bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40" };
    case "CHUYEN_MON":
      return { label: "Chuyên môn", variant: "secondary" as const, bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40" };
    case "SU_NGHIEP":
    case "PHONG_THUOC_SN":
      return { label: "Sự nghiệp", variant: "outline" as const, bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40" };
    default:
      return { label: "Đơn vị", variant: "outline" as const, bg: "bg-muted text-muted-foreground" };
  }
}

interface OrganizationUnitSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  unitTree: OrganizationUnitNode[];
  disabled?: boolean;
  isLoading?: boolean;
  error?: boolean;
}

export function OrganizationUnitSelector({
  value,
  onChange,
  unitTree,
  disabled = false,
  isLoading = false,
  error = false,
}: OrganizationUnitSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"search" | "tree">("search");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const flatUnits = useMemo(() => flattenUnitHierarchy(unitTree), [unitTree]);

  const unitMap = useMemo(() => {
    const map = new Map<string, FlatUnitItem>();
    for (const unit of flatUnits) {
      map.set(unit.code, unit);
    }
    return map;
  }, [flatUnits]);

  const selectedUnit = value ? unitMap.get(value) : undefined;

  // Lọc danh sách theo tìm kiếm và danh mục với index đã tính sẵn O(1) và deferred input
  const filteredUnits = useMemo(() => {
    const rawQ = deferredSearchQuery.trim();
    const cleanQ = removeVietnameseTones(rawQ);

    return flatUnits.filter((unit) => {
      // Lọc danh mục
      if (selectedCategory === "DANG" && unit.categoryCode !== "DANG") return false;
      if (selectedCategory === "CHINH_QUYEN" && unit.categoryCode !== "CHINH_QUYEN") return false;
      if (selectedCategory === "SU_NGHIEP" && !["SU_NGHIEP", "PHONG_THUOC_SN"].includes(unit.categoryCode || "")) return false;

      // Tìm kiếm từ khóa siêu tốc qua searchIndex
      if (!cleanQ) return true;
      return unit.searchIndex.includes(cleanQ);
    });
  }, [flatUnits, deferredSearchQuery, selectedCategory]);

  const toggleNode = (code: string) => {
    setExpandedNodes((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    for (const unit of flatUnits) {
      all[unit.code] = true;
    }
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  const handleSelect = (code: string, name?: string) => {
    onChange(code);
    setOpen(false);
    if (code) {
      toast.success(`Đã chọn đơn vị: ${name || code}`);
    } else {
      toast.info("Đã hủy gán đơn vị (Quy trình dùng chung)");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-1.5">
      {/* TRIGGER CONTAINER TRÊN SIDEBAR */}
      {selectedUnit ? (
        <div className="group relative min-w-0 rounded-lg border bg-card p-3 shadow-2xs transition-colors hover:border-primary/50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2">
              <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                {selectedUnit.categoryCode === "DANG" ? (
                  <Landmark className="size-3.5" />
                ) : (
                  <Building2 className="size-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold leading-tight text-foreground" title={selectedUnit.name}>
                  {selectedUnit.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono font-medium">
                    {selectedUnit.code}
                  </Badge>
                  {selectedUnit.categoryCode && (
                    <span className={`inline-flex items-center rounded-xs border px-1 py-0 text-[9px] font-medium ${getCategoryBadge(selectedUnit.categoryCode).bg}`}>
                      {getCategoryBadge(selectedUnit.categoryCode).label}
                    </span>
                  )}
                </div>
                {selectedUnit.pathString && (
                  <p className="mt-1 truncate text-[10px] text-muted-foreground" title={selectedUnit.pathString}>
                    {selectedUnit.pathString}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!disabled && (
            <div className="mt-2.5 flex items-center justify-end gap-1.5 border-t pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[11px] text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect("");
                }}
              >
                <X className="mr-1 size-3" />
                Hủy gán
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] text-primary hover:bg-primary/5"
                onClick={() => setOpen(true)}
              >
                Đổi đơn vị
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isLoading}
          onClick={() => setOpen(true)}
          className="flex h-10 w-full min-w-0 items-center justify-between gap-2 border-dashed px-3 text-left font-normal text-muted-foreground transition-all hover:border-primary hover:text-foreground"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs">
              {isLoading ? "Đang tải danh sách đơn vị…" : "Chọn đơn vị sở hữu quy trình…"}
            </span>
          </div>
          <Search className="size-3.5 shrink-0 opacity-60" />
        </Button>
      )}

      {error && (
        <p className="text-[11px] text-destructive">Không tải được cây cơ cấu tổ chức.</p>
      )}

      {/* MODAL DIALOG TÌM KIẾM & PHÂN CẤP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="p-4 pb-3 border-b bg-muted/20">
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-base font-semibold truncate">
                    Chọn đơn vị sở hữu quy trình
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground truncate">
                    Tìm kiếm nhanh hoặc duyệt theo cây cơ cấu tổ chức tỉnh Đắk Lắk ({flatUnits.length} đơn vị)
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Ô TÌM KIẾM NHANH */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim() && viewMode !== "search") {
                    setViewMode("search");
                  }
                }}
                placeholder="Nhập tên đơn vị (VD: Ban Tổ chức, Khoa học...), mã code (BTCTU) hoặc viết tắt..."
                className="h-10 pl-9 pr-9 text-sm rounded-lg bg-background"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* THANH CÔNG CỤ: FILTER CHIPS & CHẾ ĐỘ XEM */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: "Tất cả" },
                  { id: "DANG", label: "Khối Đảng" },
                  { id: "CHINH_QUYEN", label: "Chính quyền" },
                  { id: "SU_NGHIEP", label: "Đơn vị Sự nghiệp" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* CHUYỂN CHẾ ĐỘ DANH SÁCH / CÂY */}
              <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("search")}
                  className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-all ${
                    viewMode === "search"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListFilter className="size-3" />
                  Danh sách ({filteredUnits.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("tree")}
                  className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-all ${
                    viewMode === "tree"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FolderTree className="size-3" />
                  Cây tổ chức
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* NỘI DUNG CUỘN DANH SÁCH / CÂY */}
          <ScrollArea className="flex-1 max-h-[50vh] p-3">
            {/* TÙY CHỌN DÙNG CHUNG TOÀN HỆ THỐNG */}
            <div className="mb-2">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                  !value
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-dashed bg-card/50 hover:bg-muted/40 hover:border-border"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Globe className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      Không gán đơn vị (Quy trình dùng chung)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Áp dụng chung cho tất cả cơ quan, ban ngành trong tỉnh
                    </p>
                  </div>
                </div>
                {!value && <Check className="size-4 text-primary shrink-0" />}
              </button>
            </div>

            {viewMode === "search" ? (
              /* DANH SÁCH TÌM KIẾM FLAT CÓ BREADCRUMBS */
              filteredUnits.length > 0 ? (
                <div className="space-y-1.5">
                  {filteredUnits.map((unit) => {
                    const isCurrent = value === unit.code;
                    const catBadge = getCategoryBadge(unit.categoryCode);

                    return (
                      <button
                        key={unit.code}
                        type="button"
                        onClick={() => handleSelect(unit.code, unit.name)}
                        className={`flex w-full items-start justify-between gap-3 rounded-lg border p-2.5 text-left transition-all ${
                          isCurrent
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md ${
                            unit.categoryCode === "DANG" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"
                          }`}>
                            {unit.categoryCode === "DANG" ? (
                              <Landmark className="size-3.5" />
                            ) : (
                              <Building className="size-3.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate text-xs font-semibold text-foreground leading-snug">
                                {unit.name}
                              </span>
                              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono">
                                {unit.code}
                              </Badge>
                              {unit.categoryCode && (
                                <span className={`inline-flex items-center rounded-xs border px-1 py-0 text-[9px] font-medium ${catBadge.bg}`}>
                                  {catBadge.label}
                                </span>
                              )}
                            </div>
                            {unit.pathString && (
                              <p className="mt-1 truncate text-[11px] text-muted-foreground leading-none">
                                {unit.pathString}
                              </p>
                            )}
                          </div>
                        </div>

                        {isCurrent && (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <Building2 className="mb-2 size-8 text-muted-foreground opacity-40" />
                  <p className="text-xs font-medium text-foreground">Không tìm thấy đơn vị nào phù hợp</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Thử tìm với từ khóa khác (ví dụ: &quot;Đảng&quot;, &quot;Sở&quot;, &quot;Huyện&quot;) hoặc đổi bộ lọc danh mục.
                  </p>
                </div>
              )
            ) : (
              /* CHẾ ĐỘ DUYỆT CÂY TỔ CHỨC PHÂN CẤP (TREE VIEW) */
              <div className="space-y-1">
                <div className="mb-2 flex items-center justify-end gap-2 pr-1">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Mở rộng tất cả
                  </button>
                  <span className="text-muted-foreground text-xs">•</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="text-[11px] text-muted-foreground hover:underline"
                  >
                    Thu gọn tất cả
                  </button>
                </div>

                {unitTree.map((node) => (
                  <TreeUnitNodeItem
                    key={node.code || node.id}
                    node={node}
                    selectedCode={value}
                    onSelect={handleSelect}
                    expandedNodes={expandedNodes}
                    onToggle={toggleNode}
                    level={0}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Đang chọn:</span>
              {selectedUnit ? (
                <span className="truncate text-xs font-medium text-foreground">
                  {selectedUnit.name} ({selectedUnit.code})
                </span>
              ) : (
                <span className="text-xs italic text-muted-foreground">Dùng chung (Chưa gán)</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 text-xs"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Component đệ quy hiển thị nhánh cây tổ chức */
function TreeUnitNodeItem({
  node,
  selectedCode,
  onSelect,
  expandedNodes,
  onToggle,
  level = 0,
}: {
  node: OrganizationUnitNode;
  selectedCode?: string;
  onSelect: (code: string, name: string) => void;
  expandedNodes: Record<string, boolean>;
  onToggle: (code: string) => void;
  level?: number;
}) {
  const children = node.children ?? node.subordinateUnits ?? [];
  const hasChildren = children.length > 0;
  const isExpanded = node.code ? Boolean(expandedNodes[node.code]) : true;
  const isSelected = node.code && selectedCode === node.code;
  const catBadge = getCategoryBadge(node.categoryCode);

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between gap-2 rounded-md py-1.5 pr-2 transition-colors ${
          isSelected
            ? "bg-primary/10 text-primary font-semibold"
            : "hover:bg-muted/50 text-foreground"
        }`}
        style={{ paddingLeft: `${Math.max(0.5, level * 1.25)}rem` }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (node.code) onToggle(node.code);
              }}
              className="flex size-5 shrink-0 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}

          <div
            role="button"
            tabIndex={0}
            onClick={() => node.code && onSelect(node.code, node.name)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (node.code) onSelect(node.code, node.name);
              }
            }}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
          >
            {node.categoryCode === "DANG" ? (
              <Landmark className="size-3.5 shrink-0 text-red-500" />
            ) : hasChildren ? (
              <Building2 className="size-3.5 shrink-0 text-blue-500" />
            ) : (
              <Building className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-xs">{node.name}</span>
            {node.code && (
              <span className="rounded-xs bg-muted px-1 py-0 text-[10px] font-mono text-muted-foreground">
                {node.code}
              </span>
            )}
            {node.categoryCode && (
              <span className={`hidden sm:inline-flex rounded-xs border px-1 py-0 text-[9px] font-medium ${catBadge.bg}`}>
                {catBadge.label}
              </span>
            )}
          </div>
        </div>

        {node.code && (
          <Button
            type="button"
            variant={isSelected ? "default" : "ghost"}
            size="sm"
            onClick={() => onSelect(node.code, node.name)}
            className={`h-6 px-2 text-[11px] ${
              isSelected ? "bg-primary text-primary-foreground" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {isSelected ? "Đang chọn" : "Chọn"}
          </Button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-border/40 ml-2.5">
          {children.map((child) => (
            <TreeUnitNodeItem
              key={child.code || child.id}
              node={child}
              selectedCode={selectedCode}
              onSelect={onSelect}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
