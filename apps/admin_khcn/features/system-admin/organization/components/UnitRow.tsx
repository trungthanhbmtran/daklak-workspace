"use client";

import { memo } from "react";
import { Building2, ChevronDown, ChevronRight, FolderOpen, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrganizationUnitNode } from "../types";
import { UnitTree } from "./UnitTree";

export interface UnitRowProps {
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
}

function UnitRowComponent({
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
}: UnitRowProps) {
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
                                className={`h-5 w-5 rounded transition-colors ${isSelected ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-black/10"
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleExpand(unit.id);
                                }}
                            >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                        ) : (
                            <span className="h-4 w-4 inline-block" />
                        )}
                    </div>
                    <span className="shrink-0 flex justify-center mt-[2px]">
                        {hasChildren && isExpanded ? (
                            <FolderOpen className={`h-4 w-4 ${isSelected ? "text-primary" : "text-blue-500/80"}`} />
                        ) : (
                            <Building2 className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground/70"}`} />
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

/**
 * So sánh props tùy chỉnh: đây là điểm mấu chốt để tránh reload dư thừa.
 *
 * - Với các props "hiển thị trực tiếp" (unit, level, isSelected, isExpanded,
 *   hasChildren, các callback) chỉ cần khác nhau là phải render lại.
 * - `activeId` và `expandedIds` (Set) đổi tham chiếu ở MỌI lần người dùng
 *   chọn node khác hoặc đóng/mở một nhánh bất kỳ trong toàn cây — nếu so
 *   sánh thẳng hai props này, gần như dòng nào cũng bị render lại dù không
 *   liên quan. Vì vậy chỉ khi dòng này đang mở rộng và có node con (tức là
 *   thay đổi ở đâu đó có thể rơi vào bên trong nhánh của nó) mới cần so
 *   sánh `activeId`/`expandedIds`; các dòng còn lại bỏ qua an toàn.
 */
function arePropsEqual(prev: UnitRowProps, next: UnitRowProps) {
    if (
        prev.unit !== next.unit ||
        prev.level !== next.level ||
        prev.isSelected !== next.isSelected ||
        prev.isExpanded !== next.isExpanded ||
        prev.hasChildren !== next.hasChildren ||
        prev.onSelect !== next.onSelect ||
        prev.onToggleExpand !== next.onToggleExpand ||
        prev.onAddChild !== next.onAddChild
    ) {
        return false;
    }

    if (next.hasChildren && next.isExpanded) {
        return prev.activeId === next.activeId && prev.expandedIds === next.expandedIds;
    }

    return true;
}

export const UnitRow = memo(UnitRowComponent, arePropsEqual);