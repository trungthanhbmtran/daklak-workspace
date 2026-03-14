import { ChevronDown, ChevronRight, CornerDownRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItem } from "../types";
import { renderIcon } from "../utils";

interface MenuTreeProps {
  menus: MenuItem[];
  parentId: number | null;
  level: number;
  visibleIds: Set<number> | null;
  expandedRows: Record<number, boolean>;
  searchTerm: string;
  selectedMenuId?: number;
  onSelect: (menu: MenuItem) => void;
  onAddChild: (menu: MenuItem) => void;
  onToggleExpand: (id: number) => void;
}

export function MenuTree({ menus, parentId, level, visibleIds, expandedRows, searchTerm, selectedMenuId, onSelect, onAddChild, onToggleExpand }: MenuTreeProps) {
  const children = menus
    .filter(m => m.parentId === parentId)
    .filter(m => !visibleIds || visibleIds.has(m.id))
    .sort((a, b) => a.sort - b.sort);

  if (children.length === 0) return null;

  return (
    <div className="space-y-1" style={{ paddingLeft: level === 0 ? 0 : 20 }}>
      {children.map((menu) => {
        const isExpanded = searchTerm ? true : expandedRows[menu.id];
        const hasChildren = menus.some(m => m.parentId === menu.id);
        const isSelected = selectedMenuId === menu.id;

        return (
          <div key={menu.id} className="relative">
            {level > 0 && <div className="absolute left-[-10px] top-0 bottom-0 w-px bg-border/60" />}
            <div 
              onClick={() => onSelect(menu)}
              className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all relative ${
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
              }`}
            >
              {level > 0 && <CornerDownRight className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-3 w-3 text-border" />}
              
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(menu.id); }} 
                  className={`h-4 w-4 flex items-center justify-center rounded hover:bg-black/10 ${!hasChildren && "invisible"}`}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                <span className={isSelected ? "text-primary-foreground" : "text-primary"}>{renderIcon(menu.icon)}</span>
                <span className="text-sm font-medium truncate">{menu.name}</span>
              </div>

              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onAddChild(menu); }}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {isExpanded && hasChildren && (
              <MenuTree 
                menus={menus} parentId={menu.id} level={level + 1}
                visibleIds={visibleIds} expandedRows={expandedRows}
                searchTerm={searchTerm} selectedMenuId={selectedMenuId}
                onSelect={onSelect} onAddChild={onAddChild} onToggleExpand={onToggleExpand}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
