"use client";

import { useGetCategoryGroups } from "./hooks/useCategoryApi";
import { useCategoryUI } from "./hooks/useCategoryUI";
import { CategorySidebar } from "./components/CategorySidebar";
import { CategoryContent } from "./components/CategoryContent";
import { useState, useEffect } from "react";

export function CategoryClient() {
  const { data: groups, isLoading: isLoadingGroups } = useGetCategoryGroups();
  const [activeGroup, setActiveGroup] = useState<string>("");

  useEffect(() => {
    if (!activeGroup && groups && groups.length > 0) {
      setActiveGroup(groups[0].code);
    }
  }, [groups, activeGroup]);
  const ui = useCategoryUI([], groups || []);

  return (
    <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 min-w-0">
      <CategorySidebar
        isLoading={isLoadingGroups}
        searchGroupTerm={ui.state.searchGroupTerm}
        setSearchGroupTerm={ui.setters.setSearchGroupTerm}
        filteredGroups={ui.derived.filteredGroups}
        activeGroup={activeGroup}
        uniqueGroups={ui.derived.uniqueGroups}
        onSelectGroup={(group) => { setActiveGroup(group); }}
      />
      {activeGroup && (
        <CategoryContent activeGroup={activeGroup} groups={groups || []} />
      )}
    </div>
  );
}
