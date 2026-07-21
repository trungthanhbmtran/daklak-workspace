"use client";

import { useState } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Plus, Search as SearchIcon, ChevronRight, Building2, ChevronDown, FolderOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useOrganizationContext } from "../context/OrganizationContext";
import type { OrganizationUnitNode } from "../types";

function UnitRow({
  unit,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  expandedIds,
  activeId,
  onSelect,
  onToggleExpand,
  onAddChild,
}: {
  unit: OrganizationUnitNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  expandedIds: Set<number>;
  activeId?: number;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (id: number) => void;
}) {
  return (
    <li className="relative z-10">
      <div
        role="button"
        tabIndex={0}
        className={`group flex items-start justify-between min-w-0 py-2 pr-2 rounded-md cursor-pointer transition-colors ${isSelected
            ? "bg-primary/10 border border-primary/20"
            : "hover:bg-muted text-foreground border border-transparent"
          }`}
        style={{ paddingLeft: `${4 + level * 20}px` }}
        onClick={() => onSelect(unit.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(unit.id);
          }
        }}
      >
        <div className="flex items-start gap-1.5 min-w-0 flex-1 pl-1">
          <div className="w-5 shrink-0 flex justify-center mt-[2px]">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="icon"
                className={`h-5 w-5 rounded transition-colors ${isSelected ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-black/10"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(unit.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <span className="h-4 w-4 inline-block" />
            )}
          </div>
          <span className="shrink-0 flex justify-center mt-[2px]">
            {hasChildren && isExpanded ? (
              <FolderOpen
                className={`h-4 w-4 ${isSelected ? "text-primary" : "text-blue-500/80"}`}
              />
            ) : (
              <Building2
                className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground/70"}`}
              />
            )}
          </span>
          <div className="flex flex-col gap-1 min-w-0 flex-1 pl-1">
            <span
              className={`text-sm leading-snug wrap-break-word ${isSelected ? "font-semibold text-primary" : "font-medium"}`}
              title={unit.name}
            >
              {unit.name}
            </span>
            <div className="flex items-center">
              <Badge
                variant="secondary"
                className={`inline-flex h-4 px-1 text-[10px] uppercase font-mono tracking-wider shrink-0 ${isSelected ? "bg-primary/20 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
              >
                {unit.code}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-start pl-2 shrink-0 mt-[2px]">
          {!isSelected && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background shadow-sm border border-transparent hover:border-border"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(unit.id);
              }}
              title="Thêm đơn vị con"
            >
              <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
          {isSelected && <span className="h-2 w-2 rounded-full bg-primary mt-1 shadow-sm" />}
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="mt-1">
          <UnitTree
            nodes={unit.children ?? []}
            level={level + 1}
            expandedIds={expandedIds}
            activeId={activeId}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            onAddChild={onAddChild}
          />
        </div>
      )}
    </li>
  );
}

function UnitTree({
  nodes,
  level,
  expandedIds,
  activeId,
  onSelect,
  onToggleExpand,
  onAddChild,
}: {
  nodes: OrganizationUnitNode[];
  level: number;
  expandedIds: Set<number>;
  activeId?: number;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (id: number) => void;
}) {
  if (nodes.length === 0) return null;

  return (
    <ul className="space-y-1 list-none relative">
      {level > 0 && (
        <div
          className="absolute top-0 bottom-0 left-0 border-l border-border/50 z-0"
          style={{ marginLeft: `${10 + (level - 1) * 20}px` }}
        />
      )}
      {nodes.map((unit) => {
        const isSelected = activeId === unit.id;
        const isExpanded = expandedIds.has(unit.id);
        const hasChildren = unit.children && unit.children.length > 0;
        return (
          <UnitRow
            key={unit.id}
            unit={unit}
            level={level}
            isSelected={isSelected}
            isExpanded={isExpanded}
            hasChildren={Boolean(hasChildren)}
            expandedIds={expandedIds}
            activeId={activeId}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            onAddChild={onAddChild}
          />
        );
      })}
    </ul>
  );
}

export function OrganizationSidebar() {
  const { state } = useOrganizationContext();
  const { flatUnits, tree } = state;
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // Determine activeId from route params or searchParams
  const routeId = params?.id ? Number(params.id) : undefined;
  const parentIdStr = searchParams.get('parentId');
  const parentId = parentIdStr ? Number(parentIdStr) : undefined;
  const activeId = routeId ?? parentId;

  const searchTerm = searchParams.get('search') || "";
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tự động expand tất cả khi có searchTerm
  const effectiveExpandedIds = searchTerm.trim() ? new Set(flatUnits.map(u => u.id)) : expandedIds;

  const handleSelect = (id: number) => {
    router.push(`/services/admin/organization/${id}`);
  };

  const handleAddChild = (id: number) => {
    router.push(`/services/admin/organization/create?parentId=${id}`);
  };

  const handleAddRoot = () => {
    router.push(`/services/admin/organization/create`);
  };

  return (
    <Card className="w-full lg:w-[380px] flex flex-col h-full shrink-0 rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="shrink-0 p-4 space-y-4 border-b bg-muted/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
            </div>
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Cơ cấu tổ chức
            </h2>
          </div>
          <Button
            size="sm"
            className="h-8 shrink-0 px-3 shadow-sm bg-primary hover:bg-primary/90"
            onClick={handleAddRoot}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-medium">Thêm gốc</span>
          </Button>
        </div>

        <Search placeholder="Tìm tên hoặc mã đơn vị..." className="w-full" />
      </div>

      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="p-3">
          {flatUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground gap-3">
              <div className="p-4 rounded-full bg-muted/50 border border-dashed">
                <Building2 className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <div>
                <p className="font-medium text-foreground">Chưa có dữ liệu</p>
                <p className="text-xs mt-1">Nhấn &quot;Thêm gốc&quot; để tạo đơn vị đầu tiên.</p>
              </div>
            </div>
          ) : searchTerm.trim() && tree.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <SearchIcon className="h-6 w-6 text-muted-foreground/30" />
              <p>Không tìm thấy kết quả phù hợp.</p>
            </div>
          ) : (
            <UnitTree
              nodes={tree}
              level={0}
              expandedIds={effectiveExpandedIds}
              activeId={activeId}
              onSelect={handleSelect}
              onToggleExpand={toggleExpand}
              onAddChild={handleAddChild}
            />
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
