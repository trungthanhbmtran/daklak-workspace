"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus, Search, ChevronRight, Building2, ChevronDown, FolderOpen, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useOrganizationContext } from "../context/OrganizationContext";
import type { OrganizationUnitNode } from "../types";

const ROOT_DROP_ID = "org-root";

function getDescendantIds(flatUnits: OrganizationUnitNode[], unitId: number): Set<number> {
  const set = new Set<number>();
  const stack = [unitId];
  while (stack.length) {
    const id = stack.pop()!;
    flatUnits.filter((u) => u.parentId === id).forEach((u) => {
      set.add(u.id);
      stack.push(u.id);
    });
  }
  return set;
}

function UnitRow({
  unit,
  level,
  isSelected,
  isExpanded,
  hasChildren,
  expandedIds,
  flatUnits,
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
  flatUnits: OrganizationUnitNode[];
  activeId?: number;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (id: number) => void;
}) {
  const id = `unit-${unit.id}`;
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id,
    data: { unit },
  });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id, data: { unit } });

  const setRef = (el: HTMLDivElement | null) => {
    setDragRef(el);
    setDropRef(el);
  };

  return (
    <li className="relative z-10">
      <div
        ref={setRef}
        role="button"
        tabIndex={0}
        className={`group flex items-start justify-between min-w-0 py-2 pr-2 rounded-md cursor-pointer transition-colors ${
          isDragging ? "opacity-50" : ""
        } ${isOver ? "ring-2 ring-primary/50 bg-primary/5" : ""} ${
          isSelected
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
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          <div
            className="touch-none cursor-grab active:cursor-grabbing shrink-0 mt-[2px] text-muted-foreground hover:text-foreground"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <div className="w-5 shrink-0 flex justify-center mt-[2px]">
            {hasChildren ? (
              <button
                type="button"
                className={`p-0.5 rounded transition-colors ${isSelected ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-black/10"}`}
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
              </button>
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
                className={`inline-flex h-4 px-1 text-[10px] uppercase font-mono tracking-wider shrink-0 ${
                  isSelected ? "bg-primary/20 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
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
      {isExpanded && (
        <div className="mt-1">
          <UnitTree
            parentKey={unit.id}
            level={level + 1}
            flatUnits={flatUnits}
            filtered={flatUnits}
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
  parentKey,
  level,
  flatUnits,
  filtered,
  expandedIds,
  activeId,
  onSelect,
  onToggleExpand,
  onAddChild,
}: {
  parentKey: number | null;
  level: number;
  flatUnits: OrganizationUnitNode[];
  filtered: OrganizationUnitNode[];
  expandedIds: Set<number>;
  activeId?: number;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onAddChild: (id: number) => void;
}) {
  const children = filtered
    .filter((u) =>
      parentKey === null ? (u.parentId == null || u.parentId === 0) : u.parentId === parentKey
    )
    .sort((a, b) => (a.hierarchyPath ?? "").localeCompare(b.hierarchyPath ?? ""));

  if (children.length === 0) return null;

  return (
    <ul className="space-y-1 list-none relative">
      {level > 0 && (
        <div
          className="absolute top-0 bottom-0 left-0 border-l border-border/50 z-0"
          style={{ marginLeft: `${10 + (level - 1) * 20}px` }}
        />
      )}
      {children.map((unit) => {
        const isSelected = activeId === unit.id;
        const isExpanded = expandedIds.has(unit.id);
        const hasChildren = flatUnits.some((u) => u.parentId === unit.id);
        return (
          <UnitRow
            key={unit.id}
            unit={unit}
            level={level}
            isSelected={isSelected}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            expandedIds={expandedIds}
            flatUnits={flatUnits}
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
  const { state, actions } = useOrganizationContext();
  const { flatUnits, mode, selectedId, parentId } = state;
  const activeId = mode === "create_child" ? parentId : selectedId;

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleIds = searchTerm.trim()
    ? new Set(
        flatUnits.filter(
          (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.code.toLowerCase().includes(searchTerm.toLowerCase())
        ).map((u) => u.id)
      )
    : null;

  const filtered = visibleIds ? flatUnits.filter((u) => visibleIds.has(u.id)) : flatUnits;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (!activeIdStr.startsWith("unit-")) return;
    const draggedId = Number(activeIdStr.replace("unit-", ""));
    if (overIdStr === ROOT_DROP_ID) {
      actions.updateUnit(draggedId, { parentId: null });
      return;
    }
    if (!overIdStr.startsWith("unit-")) return;
    const newParentId = Number(overIdStr.replace("unit-", ""));
    if (draggedId === newParentId) return;
    const descendants = getDescendantIds(flatUnits, draggedId);
    if (descendants.has(newParentId)) return;
    actions.updateUnit(draggedId, { parentId: newParentId });
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
            onClick={actions.addRoot}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-medium">Thêm gốc</span>
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm tên hoặc mã đơn vị..."
            className="pl-8 h-9 bg-background text-sm shadow-sm transition-colors border-muted-foreground/20 focus-visible:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
          ) : searchTerm.trim() && filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Search className="h-6 w-6 text-muted-foreground/30" />
              <p>Không tìm thấy kết quả phù hợp.</p>
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <RootDropZone />
              <UnitTree
                parentKey={null}
                level={0}
                flatUnits={flatUnits}
                filtered={filtered}
                expandedIds={expandedIds}
                activeId={activeId}
                onSelect={actions.select}
                onToggleExpand={toggleExpand}
                onAddChild={actions.addChild}
              />
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

function RootDropZone() {
  const { setNodeRef, isOver } = useDroppable({ id: ROOT_DROP_ID });
  return (
    <div
      ref={setNodeRef}
      className={`mb-2 py-2 px-3 rounded-lg border border-dashed text-center text-xs text-muted-foreground transition-colors ${
        isOver ? "border-primary bg-primary/10 text-primary" : "border-muted-foreground/30"
      }`}
    >
      Thả đơn vị vào đây để đưa lên cấp gốc
    </div>
  );
}
