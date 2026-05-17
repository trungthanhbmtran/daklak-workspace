import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useEditorStore } from "../store/editorStore";
import { BlockRegistry } from "../core/registry";
import { initializeBlockRegistry } from "../blocks";
import { useDndSensors } from "../dnd/DndWrapper";
import { LeftSidebar } from "./components/LeftSidebar";
import { EditorCanvas } from "./components/EditorCanvas";
import { RightProperties } from "./components/RightProperties";
import { Row, PageLanguage } from "../core/types";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Columns,
  Settings,
  Languages,
  Sparkles,
  CheckCircle,
  Eye,
  Undo,
  Redo
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Auto-initialize block registry if empty
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
  const sensors = useDndSensors();

  const {
    layout,
    viewport,
    activeLang,
    showLeftPanel,
    showRightPanel,
    history,
    initStore,
    setLayout,
    setViewport,
    setActiveLang,
    setShowLeftPanel,
    setShowRightPanel,
    undo,
    redo,
    addWidget
  } = useEditorStore();

  // 1. Initialize store state
  const isInitialized = React.useRef(false);
  React.useEffect(() => {
    if (!isInitialized.current) {
      initStore(initialLayout, languages);
      isInitialized.current = true;
    }
  }, [initialLayout, languages, initStore]);

  // 2. Synchronize layout mutations back to external database onChange handlers
  React.useEffect(() => {
    // Only invoke callback if we have completed initialization
    if (isInitialized.current) {
      onChange(layout);
    }
  }, [layout, onChange]);

  // 3. Handle Drag & Drop ends
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const targetRowId = overData.rowId;
    const targetColId = overData.colId;

    // Case A: Dragging a template card from LeftSidebar (adds new widget)
    if (activeData.isTemplate) {
      const blockType = activeData.blockType;
      const blockConfig = BlockRegistry.getBlock(blockType);
      if (!blockConfig) return;

      const newWidget = {
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType,
        title: { vi: blockConfig.name.vi, en: blockConfig.name.en },
        data: JSON.parse(JSON.stringify(blockConfig.defaultData)),
        settings: {},
      };

      addWidget(targetRowId, targetColId, newWidget);
    }
    // Case B: Moving an existing widget within the canvas
    else {
      const { blockId, rowId: sourceRowId, colId: sourceColId } = activeData;

      // Ensure block is moved to a different column or row location
      if (sourceRowId !== targetRowId || sourceColId !== targetColId) {
        const sourceRow = layout.find((r) => r.rowId === sourceRowId);
        const sourceCol = sourceRow?.columns.find((c) => c.id === sourceColId);
        const widget = sourceCol?.widgets.find((w) => w.id === blockId);

        if (widget) {
          // Remove widget from source column
          const updatedLayoutWithDelete = layout.map((row) => {
            if (row.rowId === sourceRowId) {
              return {
                ...row,
                columns: row.columns.map((col) => {
                  if (col.id === sourceColId) {
                    return { ...col, widgets: col.widgets.filter((w) => w.id !== blockId) };
                  }
                  return col;
                }),
              };
            }
            return row;
          });

          // Insert widget into target column
          const finalLayout = updatedLayoutWithDelete.map((row) => {
            if (row.rowId === targetRowId) {
              return {
                ...row,
                columns: row.columns.map((col) => {
                  if (col.id === targetColId) {
                    return { ...col, widgets: [...col.widgets, widget] };
                  }
                  return col;
                }),
              };
            }
            return row;
          });

          setLayout(finalLayout);
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 dark:bg-slate-950 font-sans overflow-hidden">
      {/* 1. TOP UTILITY TOOLBAR PANEL */}
      <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
        {/* Left Side: Brand Logo, Lang selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Headless Visual CMS</span>
              <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight mt-0.5">Page Builder</span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-100 dark:bg-slate-850 shrink-0" />

          {/* Multilingual Selector */}
          <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-1 shrink-0">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                  activeLang === lang.code
                    ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm font-black border border-slate-100/50 dark:border-slate-850"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center Side: Viewport Frame Breakpoints */}
        <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              viewport === "desktop"
                ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm border border-slate-100/50 dark:border-slate-850"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
            )}
            title="Giao diện Máy tính"
          >
            <Monitor className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              viewport === "tablet"
                ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm border border-slate-100/50 dark:border-slate-850"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
            )}
            title="Giao diện Máy tính bảng"
          >
            <Tablet className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
              viewport === "mobile"
                ? "bg-white dark:bg-slate-950 text-indigo-600 dark:text-white shadow-sm border border-slate-100/50 dark:border-slate-850"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
            )}
            title="Giao diện Điện thoại"
          >
            <Smartphone className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Right Side: History (Undo/Redo) & UI Layout toggles */}
        <div className="flex items-center gap-4">
          {/* History control buttons */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={history.past.length === 0}
              className="w-9 h-9 rounded-xl border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-500 disabled:opacity-40"
              title="Hoàn tác (Undo)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={history.future.length === 0}
              className="w-9 h-9 rounded-xl border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-500 disabled:opacity-40"
              title="Làm lại (Redo)"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-100 dark:bg-slate-850 shrink-0" />

          {/* Toggle Panels visibility */}
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
              className={cn(
                "w-9 h-9 rounded-xl border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 transition-all",
                showLeftPanel ? "bg-slate-50 dark:bg-slate-900 border-indigo-200 text-indigo-650" : "text-slate-500"
              )}
              title="Ẩn/Hiện Thư viện trái"
            >
              <Columns className="w-4.5 h-4.5 rotate-180" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={cn(
                "w-9 h-9 rounded-xl border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-950 transition-all",
                showRightPanel ? "bg-slate-50 dark:bg-slate-900 border-indigo-200 text-indigo-650" : "text-slate-500"
              )}
              title="Ẩn/Hiện Bảng thuộc tính phải"
            >
              <Settings className="w-4.5 h-4.5" />
            </Button>
          </div>

          {/* Preview button */}
          {onPreview && (
            <Button
              onClick={onPreview}
              className="h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-900 text-white hover:bg-slate-850 flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" /> Xem trước
            </Button>
          )}
        </div>
      </header>

      {/* 2. MIDDLE visual sandbox workspace */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          {showLeftPanel && <LeftSidebar />}

          <EditorCanvas />

          {showRightPanel && <RightProperties />}
        </DndContext>
      </div>
    </div>
  );
};

export default VisualEditor;
