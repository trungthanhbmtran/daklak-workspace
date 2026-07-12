"use client";

import { Plus, ChevronRight, LayoutList, Layers, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebarLogic } from "../hooks/useSidebarLogic";
import { useMenuApi } from "../hooks/useMenuApi";
import { useParams } from "next/navigation";

export function MenuSidebar() {
  const { menus, isLoadingMenus } = useMenuApi();
  const params = useParams<{ id: string }>();
  const activeId = params?.id ? Number(params.id) : undefined;

  const { searchTerm, expandedRows, visibleIds, toggleExpand } = useSidebarLogic(menus);

  const filteredMenus = menus.filter(m => visibleIds ? visibleIds.has(m.id) : true);

  // LOGIC CHẾ ĐỘ 1: VIEW THEO NGHIỆP VỤ (CÂY CHA - CON)
  const renderBusinessTree = (parentId: number | null, level: number = 0) => {
    const children = filteredMenus.filter(m => parentId ? m.parentId === parentId : !m.parentId).sort((a, b) => a.sort - b.sort);
    if (children.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {children.map(menu => {
          const isSelected = activeId === menu.id;
          const isExpanded = searchTerm ? true : expandedRows[menu.id];
          const hasChildren = menus.some(m => m.parentId === menu.id);

          return (
            <div key={menu.id}>
              <Link
                href={`/services/admin/menus/${menu.id}`}
                className={`group flex items-center justify-between p-2 rounded-lg transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-foreground"
                  }`}
                style={{ paddingLeft: `${(level * 16) + 8}px` }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {hasChildren ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-5 w-5 rounded-sm hover:bg-black/10 transition-colors ${isSelected ? "text-primary-foreground hover:text-primary-foreground" : "text-muted-foreground"}`}
                      onClick={(e) => { e.preventDefault(); toggleExpand(menu.id); }}
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </Button>
                  ) : (
                    <LayoutList className={`h-3.5 w-3.5 ml-1 ${isSelected ? "opacity-90" : "text-muted-foreground/50"}`} />
                  )}
                  <div className="flex-1 min-w-0 leading-tight">
                    <p className={`text-[13px] truncate transition-colors ${isSelected ? "font-bold" : "font-medium"}`}>
                      {menu.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className={`text-[10px] font-mono truncate uppercase ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                        {menu.code}
                      </p>
                      {menu.type && (
                        <>
                          <span className={`text-[8px] ${isSelected ? "text-primary-foreground/30" : "text-muted-foreground/30"}`}>•</span>
                          <Badge
                            variant={menu.type === 'SERVICE_ITEM' ? 'default' : 'secondary'}
                            className={`text-[9px] px-1.5 py-0 h-4 min-h-0 font-bold rounded-sm ${isSelected
                              ? (menu.type === 'SERVICE_ITEM' ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30' : 'bg-white/10 text-white hover:bg-white/20')
                              : ''
                              }`}
                          >
                            {menu.type === 'SERVICE_ITEM' ? 'SERVICE_ITEM' : 'MENU'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!isSelected && (
                  <Button
                    size="icon" variant="ghost" asChild
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-background shrink-0 transition-opacity"
                  >
                    <Link href={`/services/admin/menus/create?parentId=${menu.id}`} onClick={(e) => e.stopPropagation()}>
                      <Plus className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40 mr-2 shrink-0" />}
              </Link>
              {isExpanded && renderBusinessTree(menu.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full lg:w-[350px] flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0 rounded-xl bg-background p-0 gap-0">
      <div className="p-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" /> Quản lý Menu
          </h3>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-primary hover:bg-primary/10" asChild>
            <Link href="/services/admin/menus/create">
              <Plus className="h-4 w-4 mr-1" /> Thêm gốc
            </Link>
          </Button>
        </div>

        <div className="mt-3 w-full">
          <Search
            placeholder="Tìm tên, mã..."
            className="w-full"

          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin bg-muted/5">
        {isLoadingMenus ? (
          <div className="flex justify-center items-center py-6 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-xs">Đang tải cấu trúc Menu...</span>
          </div>
        ) : (
          renderBusinessTree(null)
        )}
      </div>
    </Card>
  );
}
