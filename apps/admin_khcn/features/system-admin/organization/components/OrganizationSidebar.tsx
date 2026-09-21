"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "./EmptyState";
import { NoResultsState } from "./NoResultsState";
import { SidebarHeader } from "./SidebarHeader";
import { UnitTree } from "./UnitTree";
import { useOrganizationSidebar } from "../hooks/Useorganizationsidebar";

export function OrganizationSidebar() {
  const {
    flatUnits,
    tree,
    searchTerm,
    activeId,
    expandedIds,
    toggleExpand,
    handleSelect,
    handleAddChild,
    handleAddRoot,
  } = useOrganizationSidebar();

  const isEmpty = flatUnits.length === 0;
  const hasNoSearchResults = !isEmpty && searchTerm.trim() && tree.length === 0;

  return (
    <Card className="w-full lg:w-[380px] flex flex-col h-full shrink-0 rounded-xl border bg-card shadow-sm overflow-hidden">
      <SidebarHeader onAddRoot={handleAddRoot} />

      <ScrollArea className="flex-1 min-h-0 bg-background">
        <div className="p-3">
          {isEmpty ? (
            <EmptyState />
          ) : hasNoSearchResults ? (
            <NoResultsState />
          ) : (
            <UnitTree
              nodes={tree}
              level={0}
              expandedIds={expandedIds}
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