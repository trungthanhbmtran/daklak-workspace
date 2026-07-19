/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { CategoryItem } from "../types";

export function useCategoryUI(serverData: CategoryItem[] = [], groups: { code: string; name: string }[] = []) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [searchGroupTerm, setSearchGroupTerm] = useState("");
  // Mặc định rỗng — sẽ tự động chọn group đầu tiên khi data load xong
  const [activeGroup, setActiveGroup] = useState<string>("");

  // Khi groups được fetch xong, tự động chọn group đầu tiên (nếu chưa có)
  useEffect(() => {
    if (!activeGroup && groups.length > 0) {
      setActiveGroup(groups[0].code);
    }
  }, [groups, activeGroup]);

  // Trạng thái điều khiển Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);

  const uniqueGroups = useMemo(() => {
    // Hoàn toàn lấy từ Server (groups), nếu chưa tải xong thì có thể fallback tạm từ serverData
    if (groups && groups.length > 0) return groups;
    const codes = Array.from(new Set(serverData.map((item) => item.group)));
    return codes.map(c => ({ code: c, name: c }));
  }, [serverData, groups]);

  const filteredGroups = useMemo(() => {
    return uniqueGroups.filter((group) => {
      return group.name.toLowerCase().includes(searchGroupTerm.toLowerCase()) ||
        group.code.toLowerCase().includes(searchGroupTerm.toLowerCase());
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
    setters: { setSearchGroupTerm, setActiveGroup, setIsCreateOpen, setEditingItem },
    derived: { uniqueGroups, filteredGroups, filteredData }
  };
}
