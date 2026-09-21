"use client";

import { memo } from "react";
import type { OrganizationUnitNode } from "../types";
import { UnitRow } from "./UnitRow";

export interface UnitTreeProps {
    nodes: OrganizationUnitNode[];
    level: number;
    expandedIds: Set<number>;
    activeId?: number;
    onSelect: (id: number) => void;
    onToggleExpand: (id: number) => void;
    onAddChild: (id: number) => void;
}

function UnitTreeComponent({
    nodes,
    level,
    expandedIds,
    activeId,
    onSelect,
    onToggleExpand,
    onAddChild,
}: UnitTreeProps) {
    if (nodes.length === 0) return null;

    return (
        <div className="relative">
            {level > 0 && (
                <div
                    className="absolute top-0 bottom-0 left-0 border-l border-border/50 z-0"
                    style={{ marginLeft: `${10 + (level - 1) * 20}px` }}
                />
            )}
            <ul className="space-y-1 list-none relative">
                {nodes.map((unit) => {
                    const isSelected = activeId === unit.id;
                    const isExpanded = expandedIds.has(unit.id);
                    const hasChildren = Boolean(unit.children && unit.children.length > 0);
                    return (
                        <UnitRow
                            key={unit.id}
                            unit={unit}
                            level={level}
                            isSelected={isSelected}
                            isExpanded={isExpanded}
                            hasChildren={hasChildren}
                            expandedIds={expandedIds}
                            activeId={activeId}
                            onSelect={onSelect}
                            onToggleExpand={onToggleExpand}
                            onAddChild={onAddChild}
                        />
                    );
                })}
            </ul>
        </div>
    );
}

// Bản thân việc map qua danh sách node rất rẻ; phần tốn kém (subtree lớn)
// đã được chặn re-render ở UnitRow, nên ở đây chỉ cần memo mặc định (shallow)
// để tránh tính toán lại khi props không đổi.
export const UnitTree = memo(UnitTreeComponent);