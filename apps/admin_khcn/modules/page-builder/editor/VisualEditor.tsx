"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Row, PageLanguage } from "../core/types";
import { initializeBlockRegistry } from "../blocks";
import { BlockRegistry } from "../core/registry";

// Import hệ thống quản lý Theme toàn cục và sub-modules rã nhỏ
import { useThemeConfig } from "@/features/posts/components/theme/ThemeProvider";
import { useVisualEditor } from "../hooks/useVisualEditor";
import { EditorToolbar } from "./components/EditorToolbar";
import { EditorSandbox } from "./components/EditorSandbox";

// Auto-initialize block registry nếu trống
if (BlockRegistry.getAllBlocks().length === 0) {
  initializeBlockRegistry();
}

interface VisualEditorProps {
  initialLayout: Row[];
  onChange: (layout: Row[]) => void;
  languages: PageLanguage[];
  onPreview?: () => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  initialLayout = [],
  onChange,
  languages = [],
  onPreview
}) => {
  // 1. Gọi hook phân rã logic hoạt động
  const { sensors, store, handleDragEnd } = useVisualEditor(initialLayout, languages, onChange);

  // 2. Gọi hook đồng bộ Theme trực tiếp
  const { template, typography, layout: themeLayout } = useThemeConfig();

  // Tạo class màu sắc thương hiệu đồng bộ theo Theme cấu hình màu
  const getBrandColorClasses = () => {
    switch (template) {
      case "emerald": return "from-emerald-600 to-teal-500 shadow-emerald-100 dark:shadow-none";
      case "violet": return "from-violet-600 to-purple-500 shadow-violet-100 dark:shadow-none";
      case "amber": return "from-amber-600 to-orange-500 shadow-amber-100 dark:shadow-none";
      case "blue":
      default:
        return "from-indigo-600 to-indigo-500 shadow-indigo-100 dark:shadow-none";
    }
  };

  // Tạo class bo góc đồng bộ hệ thống mẫu cấu hình UI
  const getRadiusClass = () => {
    switch (themeLayout.radius) {
      case "Sharp": return "rounded-none";
      case "Subtle": return "rounded-sm";
      case "Full": return "rounded-3xl";
      case "Medium":
      default: return "rounded-xl";
    }
  };

  // Tạo class font-family đồng bộ hệ thống mẫu cấu hình UI
  const getFontFamilyClass = () => {
    switch (typography.heading) {
      case "playfair":
      case "merriweather": return "font-serif";
      case "Geist": return "font-mono";
      case "inter":
      default: return "font-sans";
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden select-none",
        getFontFamilyClass(),
        themeLayout.isCompact && "cms-density-compact"
      )}
      style={{ fontSize: `${typography.size}px` }}
    >
      {/* A. HIỂN THỊ PHÂN HỆ BANEL TOOLBAR ĐIỀU KHIỂN */}
      <EditorToolbar
        languages={languages}
        activeLang={store.activeLang}
        setActiveLang={store.setActiveLang}
        viewport={store.viewport}
        setViewport={store.setViewport}
        history={store.history}
        undo={store.undo}
        redo={store.redo}
        showLeftPanel={store.showLeftPanel}
        setShowLeftPanel={store.setShowLeftPanel}
        showRightPanel={store.showRightPanel}
        setShowRightPanel={store.setShowRightPanel}
        brandColorClass={getBrandColorClasses()}
        radiusClass={getRadiusClass()}
        onPreview={onPreview}
      />

      {/* B. HIỂN THỊ KHU VỰC THAO TÁC KÉO THẢ (SANDBOX) */}
      <EditorSandbox
        sensors={sensors}
        onDragEnd={handleDragEnd}
        showLeftPanel={store.showLeftPanel}
        showRightPanel={store.showRightPanel}
      />
    </div>
  );
};

export default VisualEditor;