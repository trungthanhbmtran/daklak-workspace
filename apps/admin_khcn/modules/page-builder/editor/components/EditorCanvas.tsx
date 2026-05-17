import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { BlockRenderer } from "../../renderer/BlockRenderer";
import { BlockRegistry } from "../../core/registry";
import { initializeBlockRegistry } from "../../blocks";
import { DroppableColumn, DraggableBlock } from "../../dnd/DndWrapper";
import { cn } from "@/lib/utils";
import { Trash2, Smartphone, Tablet, Monitor, Settings, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

// Auto-initialize registry if empty
if (BlockRegistry.getAllBlocks().length === 0) {
  initializeBlockRegistry();
}

// Viewport and column span parsing utilities
const parseColSpan = (colSpanStr: string) => {
  const parts = colSpanStr.split(" ");
  let mobile = 12;
  let tablet = 12;
  let desktop = 12;

  parts.forEach((p) => {
    if (p.startsWith("lg:col-span-")) {
      desktop = parseInt(p.replace("lg:col-span-", "")) || 12;
    } else if (p.startsWith("md:col-span-")) {
      tablet = parseInt(p.replace("md:col-span-", "")) || 12;
    } else if (p.startsWith("col-span-") && !p.includes(":")) {
      mobile = parseInt(p.replace("col-span-", "")) || 12;
    }
  });

  if (!colSpanStr.includes("md:col-span-")) {
    tablet = desktop;
  }
  if (!colSpanStr.includes("col-span-") || (colSpanStr.includes("col-span-") && colSpanStr.indexOf("col-span-") !== colSpanStr.indexOf(" col-span-") && !colSpanStr.startsWith("col-span-"))) {
    mobile = 12;
  }

  return { desktop, tablet, mobile };
};

const getColSpanForViewport = (colSpanStr: string, activeViewport: "desktop" | "tablet" | "mobile") => {
  const { desktop, tablet, mobile } = parseColSpan(colSpanStr || "lg:col-span-12");
  if (activeViewport === "mobile") return `col-span-${mobile}`;
  if (activeViewport === "tablet") return `col-span-${tablet}`;
  return `col-span-${desktop}`;
};

export const EditorCanvas: React.FC = () => {
  const {
    layout,
    viewport,
    selectedRowId,
    selectedWidgetId,
    activeLang,
    setSelectedRowId,
    setSelectedWidgetId,
    deleteRow,
    deleteWidget
  } = useEditorStore();

  if (layout.length === 0) {
    return (
      <div className="flex-1 h-full p-8 bg-slate-100/30 dark:bg-slate-950/20 overflow-y-auto flex items-center justify-center">
        <div className="text-center p-10 max-w-sm rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-950 shadow-xl flex flex-col items-center gap-4 py-12">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 flex items-center justify-center shadow-inner">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Canvas đang trống</h4>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black leading-relaxed">
            Kéo thả hoặc nhấp chọn các khối Sections (1 cột, 2 cột) từ thanh công cụ bên trái để bắt đầu thiết kế bố cục trang Portal của bạn.
          </p>
        </div>
      </div>
    );
  }

  // Render layout preview inside a gorgeous physical hardware frame mock
  const renderCanvasWithDeviceFrame = (children: React.ReactNode) => {
    if (viewport === "mobile") {
      return (
        <div className="relative mx-auto max-w-[375px] w-full h-[740px] bg-slate-900 dark:bg-slate-950 rounded-[48px] p-3 shadow-2xl border-[6px] border-slate-800 flex flex-col overflow-hidden animate-fade-in ring-1 ring-slate-700/50 my-auto shrink-0 select-none">
          {/* Speaker Bezel Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-30 flex items-center justify-center">
            {/* Camera Lens Circle */}
            <div className="absolute left-4 w-2.5 h-2.5 rounded-full bg-slate-955 border border-slate-800/80 shadow-inner flex items-center justify-center">
              <div className="w-1 h-1 bg-indigo-950 rounded-full"></div>
            </div>
          </div>
          
          {/* Mock Status Bar */}
          <div className="w-full h-8 px-6 flex items-center justify-between text-[9px] font-black text-slate-400 select-none bg-slate-50 dark:bg-slate-950 shrink-0 pt-2.5 z-20 border-b border-slate-100/40 dark:border-slate-900/30">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3 h-3 text-slate-400" />
              <span className="font-bold">5G</span>
              {/* Battery Mock */}
              <div className="w-4.5 h-2 rounded-sm border border-slate-400 p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-400 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-hidden relative rounded-[32px] bg-slate-50 dark:bg-slate-950">
            <div className="absolute inset-0 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-none">
              {children}
            </div>
          </div>

          {/* Home Indicator Bar */}
          <div className="w-full h-5 flex items-center justify-center bg-slate-50 dark:bg-slate-950 shrink-0 pb-1.5 z-20 border-t border-slate-100/40 dark:border-slate-900/30">
            <div className="w-24 h-1 rounded-full bg-slate-400/80"></div>
          </div>
        </div>
      );
    }

    if (viewport === "tablet") {
      return (
        <div className="relative mx-auto max-w-[768px] w-full h-[800px] bg-slate-900 dark:bg-slate-950 rounded-[32px] p-4 shadow-2xl border-[6px] border-slate-800 flex flex-col overflow-hidden animate-fade-in ring-1 ring-slate-800/50 my-auto shrink-0 select-none">
          {/* Mock Status Bar */}
          <div className="w-full h-8 px-6 flex items-center justify-between text-[9px] font-black text-slate-400 select-none bg-slate-50 dark:bg-slate-950 shrink-0 pt-1.5 z-20 border-b border-slate-100/40 dark:border-slate-900/30">
            <span className="font-bold text-[10px] text-indigo-500">Dak Lak Portal Builder</span>
            <div className="flex items-center gap-2">
              <Tablet className="w-3.5 h-3.5 text-slate-400" />
              <span>iPad Pro LTE</span>
              <div className="w-4.5 h-2 rounded-sm border border-slate-400 p-[1px] flex items-center">
                <div className="w-full h-full bg-slate-400 rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-hidden relative rounded-[16px] bg-slate-50 dark:bg-slate-950">
            <div className="absolute inset-0 overflow-y-auto p-6 space-y-6 pb-24">
              {children}
            </div>
          </div>
        </div>
      );
    }

    // Default desktop layout
    return (
      <div className="w-full h-full bg-slate-50 dark:bg-slate-950 p-6 overflow-y-auto min-h-[720px] rounded-3xl shadow-inner border border-slate-100 dark:border-slate-900/60 transition-all duration-300">
        <div className="space-y-8 pb-32">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 h-full p-8 bg-slate-100/30 dark:bg-slate-950/20 overflow-y-auto flex flex-col justify-center items-center">
      {renderCanvasWithDeviceFrame(
        layout.map((row, rowIdx) => {
          const isRowSelected = selectedRowId === row.rowId;
          const settings = row.settings || {};

          return (
            <div
              key={row.rowId}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRowId(row.rowId);
              }}
              className={cn(
                "relative group rounded-3xl border-2 border-dashed p-4 transition-all duration-300",
                isRowSelected
                  ? "border-indigo-500 dark:border-indigo-700 bg-indigo-50/10 dark:bg-indigo-950/5 ring-4 ring-indigo-50/30 dark:ring-0"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-200 dark:hover:border-slate-800"
              )}
              style={{
                backgroundColor: settings.backgroundColor || undefined,
                paddingTop: settings.paddingTop ? `${settings.paddingTop}px` : "16px",
                paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}px` : "16px",
              }}
            >
              {/* Row Indicator & Quick Actions bar */}
              <div className="absolute -top-3.5 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <div className="px-3.5 py-1.5 bg-slate-900/90 backdrop-blur-md text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 select-none">
                  <Compass className="w-3.5 h-3.5" /> Section #{rowIdx + 1}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRow(row.rowId);
                  }}
                  className="w-7 h-7 rounded-xl bg-rose-500 text-white hover:bg-rose-600 hover:text-white shadow-lg shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Grid columns */}
              <div 
                className={cn(
                  "grid grid-cols-12",
                  settings.gap || "gap-6"
                )}
              >
                {row.columns.map((col) => (
                  <DroppableColumn
                    key={col.id}
                    id={col.id}
                    rowId={row.rowId}
                    className={cn(
                      "min-h-[100px] rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800/80 p-3 transition-colors flex flex-col gap-5",
                      getColSpanForViewport(col.colSpan, viewport)
                    )}
                  >
                    {col.widgets.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center min-h-[90px] py-4 text-center select-none">
                        <span className="text-[9px] font-bold text-slate-350 dark:text-slate-650 uppercase tracking-widest leading-none">
                          Thả Widget vào đây
                        </span>
                      </div>
                    ) : (
                      col.widgets.map((widget, wIdx) => {
                        const isWidgetSelected = selectedWidgetId === widget.id;
                        const blockConfig = BlockRegistry.getBlock(widget.type);
                        const title = widget.title?.[activeLang] || blockConfig?.name?.vi || "Chưa đặt tên";

                        return (
                          <DraggableBlock
                            key={widget.id}
                            id={widget.id}
                            rowId={row.rowId}
                            colId={col.id}
                            index={wIdx}
                            className={cn(
                              "relative rounded-3xl border-2 p-5 bg-white dark:bg-slate-900 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300",
                              isWidgetSelected
                                ? "border-indigo-650 bg-white dark:bg-slate-900 ring-4 ring-indigo-50/50 dark:ring-0"
                                : "border-slate-100 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-slate-800"
                            )}
                          >
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedWidgetId(widget.id);
                              }}
                              className="w-full flex flex-col gap-4"
                            >
                              {/* Block Header indicator bar inside canvas */}
                              <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-2.5 shrink-0 select-none">
                                <div className="flex items-center gap-2">
                                  {blockConfig && (
                                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", 
                                      isWidgetSelected 
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20" 
                                        : "bg-slate-50 text-slate-450 dark:bg-slate-950"
                                    )}>
                                      <blockConfig.icon className="w-3.5 h-3.5" />
                                    </div>
                                  )}
                                  <span className={cn("text-[9px] font-black uppercase tracking-wider",
                                    isWidgetSelected ? "text-indigo-600" : "text-slate-450"
                                  )}>
                                    {title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteWidget(row.rowId, col.id, widget.id);
                                    }}
                                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Preview the dynamic block visually using BlockRenderer! */}
                              <div className="w-full pointer-events-none">
                                <BlockRenderer widget={widget} activeLang={activeLang} />
                              </div>
                            </div>
                          </DraggableBlock>
                        );
                      })
                    )}
                  </DroppableColumn>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default EditorCanvas;
