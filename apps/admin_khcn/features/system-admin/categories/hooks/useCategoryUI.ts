import { useState, useMemo } from "react";
import { CategoryItem } from "../types";
import { GROUP_LABELS } from "../constants";

export function useCategoryUI(serverData: CategoryItem[] = [], groups: string[] = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("UNIT_TYPE");

  // Trạng thái điều khiển Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);

  const uniqueGroups = useMemo(() => {
    // Hoàn toàn lấy từ Server (groups), nếu chưa tải xong thì có thể fallback tạm từ serverData
    if (groups && groups.length > 0) return groups;
    return Array.from(new Set(serverData.map((item) => item.group)));
  }, [serverData, groups]);

  const filteredGroupKeys = useMemo(() => {
    return uniqueGroups.filter((groupCode) => {
      const label = GROUP_LABELS[groupCode] || groupCode;
      return label.toLowerCase().includes(searchGroupTerm.toLowerCase());
    });
  }, [uniqueGroups, searchGroupTerm]);

  const filteredData = useMemo(() => {
    return serverData.filter((item) => {
      const matchesGroup = item.group === activeGroup;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [serverData, activeGroup, searchTerm]);

  return {
    state: { searchTerm, searchGroupTerm, activeGroup, isCreateOpen, editingItem },
    setters: { setSearchTerm, setSearchGroupTerm, setActiveGroup, setIsCreateOpen, setEditingItem },
    derived: { uniqueGroups, filteredGroupKeys, filteredData }
  };
}
