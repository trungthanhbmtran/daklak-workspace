import { useState, useEffect, useMemo } from "react";
import { MenuItem } from "../types";

export function useSidebarLogic(menus: MenuItem[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (menus.length > 0 && Object.keys(expandedRows).length === 0) {
      const initialExpanded: Record<number, boolean> = {};
      menus.filter(m => m.parentId === null).forEach(m => { initialExpanded[m.id] = true; });
      setExpandedRows(initialExpanded);
    }
  }, [menus]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleIds = useMemo(() => {
    if (!searchTerm) return null;
    const ids = new Set<number>();
    const term = searchTerm.toLowerCase();
    
    menus.forEach(menu => {
      if (menu.name.toLowerCase().includes(term) || menu.code.toLowerCase().includes(term)) {
        let current: MenuItem | undefined = menu;
        while (current) {
          ids.add(current.id);
          current = menus.find(m => m.id === current?.parentId);
        }
      }
    });
    return ids;
  }, [searchTerm, menus]);

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return { searchTerm, setSearchTerm, expandedRows, visibleIds, toggleExpand };
}
