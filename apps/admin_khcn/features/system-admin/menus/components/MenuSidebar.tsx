"use client";

import { Plus, ChevronRight, LayoutList, Layers, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSidebarLogic } from "../hooks/useSidebarLogic";
import { useMenuTreeQuery } from "../hooks/useMenuQueries";
import { useParams, useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heading, Text } from "@/components/ui/typography";
import { MenuItem } from "../types";

export function MenuSidebar() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";

  const { data: tree = [], isLoading: isLoadingMenus } = useMenuTreeQuery(searchTerm);
  const params = useParams<{ id: string }>();
  const activeId = params?.id ? Number(params.id) : undefined;

  const { expandedRows, toggleExpand } = useSidebarLogic(tree);

  // LOGIC CHẾ ĐỘ 1: VIEW THEO NGHIỆP VỤ (CÂY CHA - CON)
  const renderBusinessTree = (nodes: MenuItem[], level: number = 0) => {
    if (!nodes || nodes.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {nodes.map(menu => {
          const isSelected = activeId === menu.id;
          const isExpanded = searchTerm ? true : expandedRows[menu.id];
          const hasChildren = menu.children && menu.children.length > 0;

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
                    <Text className={`truncate transition-colors ${isSelected ? "font-bold" : "font-medium"}`}>
                      {menu.name}
                    </Text>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Text variant="small" className={`font-mono truncate uppercase ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                        {menu.code}
                      </Text>
                      {menu.type && (
                        <>
                          <span className={`text-[10px] ${isSelected ? "text-primary-foreground/30" : "text-muted-foreground/30"}`}>•</span>
                          <Badge
                            variant={menu.type === 'SERVICE_ITEM' ? 'default' : 'secondary'}
                            className={`text-xs px-1.5 py-0 h-5 min-h-0 font-medium rounded-sm ${isSelected
                              ? (menu.type === 'SERVICE_ITEM' ? 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30' : 'bg-white/10 text-white hover:bg-white/20')
                              : ''
                              }`}
                          >
                            {menu.type === 'SERVICE_ITEM' ? 'SERVICE' : 'MENU'}
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
              {isExpanded && renderBusinessTree(menu.children || [], level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full lg:w-4/12 xl:w-3/12 2xl:w-1/5 flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0 rounded-xl bg-background p-0 gap-0">
      <div className="p-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between">
          <Heading level="h4" className="uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Quản lý Menu
          </Heading>
          <Button size="sm" variant="ghost" className="h-8 px-2 md:px-3 text-xs md:text-sm font-medium text-primary hover:bg-primary/10" asChild>
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

      {isLoadingMenus ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0 bg-background">
          <div className="p-3">
            {tree.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground gap-3">
                <div className="p-3 rounded-full bg-muted/50 border border-dashed">
                  <LayoutList className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div>
                  <Text weight="medium">Chưa có menu</Text>
                  <Text variant="muted" className="mt-1">Bấm nút + để tạo mới</Text>
                </div>
              </div>
            ) : (
              renderBusinessTree(tree, 0)
            )}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
