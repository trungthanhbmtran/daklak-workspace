import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { MenuItem } from "../types";

export function useSidebarLogic(treeNodes: MenuItem[]) {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (treeNodes.length > 0 && Object.keys(expandedRows).length === 0) {
      const initialExpanded: Record<number, boolean> = {};
      treeNodes.forEach(m => { initialExpanded[m.id] = true; });
      setExpandedRows(initialExpanded);
    }
  }, [treeNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return { searchTerm, expandedRows, toggleExpand };
}
