"use client";

import { useState, useMemo } from "react";
import { Plus, Search, ChevronRight, LayoutList, Layers, ChevronDown, Server, FolderTree } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuItem } from "../types";
import { useSidebarLogic } from "../hooks/useSidebarLogic";

// Từ điển định dạng cho Service
const SERVICE_STYLE_MAP: Record<string, { label: string; dotClass: string }> = {
  "CORE_SERVICE": { label: "CORE", dotClass: "bg-slate-400" },
  "USER_SERVICE": { label: "USER", dotClass: "bg-blue-500" },
  "CONTENT_SERVICE": { label: "CONTENT", dotClass: "bg-emerald-500" },
  "HRM_SERVICE": { label: "HRM", dotClass: "bg-amber-500" },
  "NOTIFICATION_SERVICE": { label: "NOTI", dotClass: "bg-rose-500" },
  "DOCUMENT_SERVICE": { label: "DOC", dotClass: "bg-purple-500" },
  "POSTS_SERVICE": { label: "POST", dotClass: "bg-indigo-500" },
  "STORAGE_SERVICE": { label: "STORE", dotClass: "bg-cyan-500" },
  "API_GATEWAY": { label: "GW", dotClass: "bg-gray-800" },
};

interface MenuSidebarProps {
  menus: MenuItem[];
  activeId?: number;
  onSelect: (id: number) => void;
  onAddRoot: () => void;
  onAddChild: (parentId: number) => void;
}

export function MenuSidebar({ menus, activeId, onSelect, onAddRoot, onAddChild }: MenuSidebarProps) {
  const { searchTerm, setSearchTerm, expandedRows, visibleIds, toggleExpand } = useSidebarLogic(menus);
  
  // State quản lý chế độ xem: 'business' (Cây cha-con) hoặc 'service' (Nhóm theo API)
  const [viewMode, setViewMode] = useState<'business' | 'service'>('business');
  // State quản lý mở rộng/thu gọn của các nhóm Service (khi ở chế độ Service View)
  const [expandedServices, setExpandedServices] = useState<Record<string, boolean>>({});

  const filteredMenus = menus.filter(m => visibleIds ? visibleIds.has(m.id) : true);

  // LOGIC CHẾ ĐỘ 1: VIEW THEO NGHIỆP VỤ (CÂY CHA - CON)
  const renderBusinessTree = (parentId: number | null, level: number = 0) => {
    const children = filteredMenus.filter(m => m.parentId === parentId).sort((a, b) => a.sort - b.sort);
    if (children.length === 0) return null;

    return (
      <div className="space-y-0.5">
        {children.map(menu => {
          const isSelected = activeId === menu.id;
          const isExpanded = expandedRows[menu.id];
          const hasChildren = menus.some(m => m.parentId === menu.id);
          const serviceStyle = menu.service ? (SERVICE_STYLE_MAP[menu.service] || { label: "SYS", dotClass: "bg-gray-400" }) : null;

          return (
            <div key={menu.id}>
              <div 
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-foreground"
                }`}
                style={{ paddingLeft: `${(level * 16) + 8}px` }}
                onClick={() => onSelect(menu.id)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {hasChildren ? (
                    <button 
                      className={`p-0.5 rounded-sm hover:bg-black/10 transition-colors ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                      onClick={(e) => { e.stopPropagation(); toggleExpand(menu.id); }}
                    >
                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
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
                      {serviceStyle && (
                        <>
                          <span className={`text-[8px] ${isSelected ? "text-primary-foreground/30" : "text-muted-foreground/30"}`}>•</span>
                          <div className={`flex items-center gap-1 ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground/70"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${serviceStyle.dotClass} ${isSelected ? "ring-1 ring-white/30" : ""}`} />
                            <span className="text-[9px] font-semibold tracking-wide uppercase">{serviceStyle.label}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {!isSelected && (
                  <Button 
                    size="icon" variant="ghost" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-background shrink-0 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onAddChild(menu.id); }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40 mr-2 shrink-0" />}
              </div>
              {isExpanded && renderBusinessTree(menu.id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  // LOGIC CHẾ ĐỘ 2: VIEW THEO MICROSERVICE (GOM NHÓM THEO SERVICE CODE)
  const menusByService = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    filteredMenus.forEach(m => {
      const srv = m.service || "UNASSIGNED";
      if (!grouped[srv]) grouped[srv] = [];
      grouped[srv].push(m);
    });
    return grouped;
  }, [filteredMenus]);

  const toggleServiceExpand = (serviceCode: string) => {
    setExpandedServices(prev => ({ ...prev, [serviceCode]: !prev[serviceCode] }));
  };

  const renderServiceTree = () => {
    return (
      <div className="space-y-3">
        {Object.entries(menusByService).map(([serviceCode, srvMenus]) => {
          const isExpanded = expandedServices[serviceCode] !== false; // Mặc định mở
          const serviceStyle = SERVICE_STYLE_MAP[serviceCode] || { label: serviceCode, dotClass: "bg-gray-400" };

          return (
            <div key={serviceCode} className="border rounded-lg bg-muted/10 overflow-hidden">
              {/* Header của Group Service */}
              <div 
                className="flex items-center justify-between p-2 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                onClick={() => toggleServiceExpand(serviceCode)}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    {serviceCode === "UNASSIGNED" ? "Chưa gắn Service" : serviceCode}
                  </span>
                  <span className="text-[10px] bg-background border px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                    {srvMenus.length}
                  </span>
                </div>
                <Button size="icon" variant="ghost" className="h-5 w-5 hover:bg-transparent">
                  {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </Button>
              </div>

              {/* Danh sách Menu thuộc Service */}
              {isExpanded && (
                <div className="p-1 space-y-0.5">
                  {srvMenus.map(menu => {
                    const isSelected = activeId === menu.id;
                    return (
                      <div 
                        key={menu.id}
                        className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                          isSelected ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-accent text-foreground"
                        }`}
                        onClick={() => onSelect(menu.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0 pl-1">
                          <LayoutList className={`h-3 w-3 ${isSelected ? "opacity-90" : "text-muted-foreground/40"}`} />
                          <div className="flex-1 min-w-0 leading-tight">
                            <p className={`text-xs truncate transition-colors ${isSelected ? "font-bold" : "font-medium"}`}>
                              {menu.name}
                            </p>
                            <p className={`text-[9px] font-mono truncate uppercase mt-0.5 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/50"}`}>
                              {menu.code} • {menu.path}
                            </p>
                          </div>
                        </div>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/40 mr-1 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full lg:w-[350px] flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0 rounded-xl bg-background">
      <div className="p-4 border-b bg-muted/30 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" /> Quản lý Menu
          </h3>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-primary hover:bg-primary/10" onClick={onAddRoot}>
            <Plus className="h-4 w-4 mr-1" /> Thêm gốc
          </Button>
        </div>
        
        <div className="flex gap-2">
          {/* Nút Toggle giữa 2 chế độ xem */}
          <div className="flex bg-muted p-1 rounded-lg shrink-0">
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2.5 text-xs ${viewMode === 'business' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('business')}
              title="Xem theo Cây thư mục (Nghiệp vụ)"
            >
              <FolderTree className="h-3.5 w-3.5" />
            </Button>
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className={`h-7 px-2.5 text-xs ${viewMode === 'service' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setViewMode('service')}
              title="Xem theo Dịch vụ (Microservices)"
            >
              <Server className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input 
              placeholder="Tìm tên, mã..." 
              className="pl-8 h-8 text-xs bg-background focus-visible:ring-1" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin bg-muted/5">
        {viewMode === 'business' ? renderBusinessTree(null) : renderServiceTree()}
      </div>
    </Card>
  );
}
