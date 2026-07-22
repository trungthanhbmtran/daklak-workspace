import React from "react";
import { Widget } from "../../core/types";
import { StatsGridData, StatsItem } from "./stats-grid.schema";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Hash, Type } from "lucide-react";

interface StatsGridEditorProps {
  widget: Widget<StatsGridData>;
  onChangeData: (data: StatsGridData) => void;
  activeLang: string;
}

export const StatsGridEditor: React.FC<StatsGridEditorProps> = ({ widget, onChangeData, activeLang }) => {
  const items = widget.data?.items || [];

  const handleUpdateItem = (index: number, field: keyof StatsItem, val: string) => {
    const updatedItems = [...items];
    if (field === "value") {
      updatedItems[index].value = val;
    } else if (field === "label") {
      const currentLabel = updatedItems[index].label || {};
      updatedItems[index].label = {
        ...currentLabel,
        [activeLang]: val,
      };
    }
    onChangeData({ ...widget.data, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem: StatsItem = {
      value: "0",
      label: { vi: "Nhãn số liệu mới", en: "New stat label" }
    };
    onChangeData({ ...widget.data, items: [...items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, idx) => idx !== index);
    onChangeData({ ...widget.data, items: updatedItems });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between px-1">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Danh sách số liệu ({items.length})
        </Label>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddItem}
          className="h-8 rounded-xl border-dashed border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 gap-1"
         iconStart={<Plus className="w-3.5 h-3.5" />}>Thêm số liệu</Button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/30">
            <span className="text-[10px] font-black uppercase text-slate-350 dark:text-slate-650 tracking-widest">Chưa có chỉ số nào</span>
          </div>
        ) : (
          items.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl space-y-4 relative group/item"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(idx)}
                  className="w-8 h-8 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Giá trị
                  </span>
                  <Input 
                    value={item.value}
                    onChange={(e) => handleUpdateItem(idx, "value", e.target.value)}
                    className="h-10 px-3 rounded-xl border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-black text-slate-700 dark:text-slate-200"
                  />
                </div>
                
                <div className="col-span-2 space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Type className="w-3 h-3" /> Tên chỉ số ({activeLang})
                  </span>
                  <Input 
                    value={item.label[activeLang] || ""}
                    onChange={(e) => handleUpdateItem(idx, "label", e.target.value)}
                    className="h-10 px-3 rounded-xl border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-755 dark:text-slate-250"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StatsGridEditor;
