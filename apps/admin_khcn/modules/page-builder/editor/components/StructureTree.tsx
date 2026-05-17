import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { BlockRegistry } from "../../core/registry";
import { Landmark, Building2, AlignLeft, Trash2, ArrowUp, ArrowDown, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StructureTree: React.FC = () => {
  const {
    layout,
    selectedRowId,
    selectedWidgetId,
    setSelectedRowId,
    setSelectedWidgetId,
    deleteRow,
    deleteWidget,
    moveRow
  } = useEditorStore();

  if (layout.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
        <Folder className="w-8 h-8 text-slate-300 dark:text-slate-700" />
        <span className="text-[10px] font-black uppercase text-slate-350 dark:text-slate-600 tracking-widest">
          Outline trống
        </span>
        <p className="text-[9px] text-slate-400 font-bold max-w-[180px] leading-relaxed">
          Tạo các Section để xem cấu trúc phân cấp ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1 px-0.5">
        <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">
          Cây cấu trúc trang
        </span>
      </div>

      <div className="space-y-3">
        {layout.map((row, rowIdx) => {
          const isRowSelected = selectedRowId === row.rowId;

          return (
            <div 
              key={row.rowId}
              className={`p-2.5 rounded-2xl border transition-all ${
                isRowSelected 
                  ? "bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-800" 
                  : "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-900"
              }`}
            >
              {/* Row Node Header */}
              <div className="flex items-center justify-between gap-2">
                <div 
                  onClick={() => setSelectedRowId(row.rowId)}
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                >
                  <Landmark className={`w-4 h-4 shrink-0 ${isRowSelected ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className={`text-[11px] font-bold truncate leading-tight ${isRowSelected ? "text-indigo-600" : "text-slate-700 dark:text-slate-300"}`}>
                    Section #{rowIdx + 1}
                  </span>
                </div>
                
                {/* Row Control actions */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveRow(rowIdx, "up")}
                    disabled={rowIdx === 0}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveRow(rowIdx, "down")}
                    disabled={rowIdx === layout.length - 1}
                    className="w-6 h-6 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRow(row.rowId)}
                    className="w-6 h-6 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Columns Nesting */}
              <div className="mt-2 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-2">
                {row.columns.map((col, colIdx) => (
                  <div key={col.id} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wide select-none">
                      <Building2 className="w-3 h-3 text-slate-350" />
                      Cột {colIdx + 1} ({col.colSpan.split("-").pop()} phần)
                    </div>

                    {/* Widgets inside column */}
                    {col.widgets.length > 0 && (
                      <div className="pl-3.5 space-y-1">
                        {col.widgets.map((widget) => {
                          const isWidgetSelected = selectedWidgetId === widget.id;
                          const blockConfig = BlockRegistry.getBlock(widget.type);
                          const icon = blockConfig?.icon || AlignLeft;
                          const title = widget.title?.vi || blockConfig?.name?.vi || "Chưa đặt tên";

                          return (
                            <div
                              key={widget.id}
                              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                                isWidgetSelected
                                  ? "bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-800 shadow-sm"
                                  : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 hover:border-indigo-100 dark:hover:border-slate-800"
                              }`}
                            >
                              <div
                                onClick={() => setSelectedWidgetId(widget.id)}
                                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                              >
                                {React.createElement(icon, {
                                  className: `w-3.5 h-3.5 shrink-0 ${isWidgetSelected ? "text-indigo-600" : "text-slate-400"}`
                                })}
                                <span className={`text-[10px] font-bold truncate leading-tight ${isWidgetSelected ? "text-indigo-600" : "text-slate-600 dark:text-slate-400"}`}>
                                  {title}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteWidget(row.rowId, col.id, widget.id)}
                                className="w-5 h-5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StructureTree;
