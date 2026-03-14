"use client";

import { useState } from "react";
import { MenuSidebar } from "./components/MenuSidebar";
import { MenuForm } from "./components/MenuForm";
import { useMenuApi } from "./hooks/useMenuApi";

export type ViewState = {
  mode: "idle" | "edit" | "create_root" | "create_child";
  selectedId?: number;
  parentId?: number;
};

export function MenuClient() {
  const [viewState, setViewState] = useState<ViewState>({ mode: "idle" });
  
  // Chỉ lấy API Menus ở đây để phân phát cho Sidebar và Form
  const { menus, isLoadingMenus } = useMenuApi();

  if (isLoadingMenus) {
    return <div className="h-[calc(100vh-120px)] flex items-center justify-center font-medium animate-pulse">Đang tải cấu trúc Menu...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-120px)] overflow-hidden font-sans antialiased">
      <MenuSidebar 
        menus={menus}
        activeId={viewState.selectedId}
        onSelect={(id) => setViewState({ mode: "edit", selectedId: id })}
        onAddRoot={() => setViewState({ mode: "create_root" })}
        onAddChild={(id) => setViewState({ mode: "create_child", parentId: id })}
      />
      
      <MenuForm 
        menus={menus}
        viewState={viewState}
        onSuccess={() => setViewState({ mode: "idle" })} // Đóng form khi save/delete xong
        onCancel={() => setViewState({ mode: "idle" })}
      />
    </div>
  );
} 
