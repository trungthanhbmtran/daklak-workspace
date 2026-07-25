import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { TabsContent } from "@/components/ui/tabs";

interface EndpointEditorKeyValueTabProps {
  value: string;
  items: any[];
  type: 'headers' | 'params';
  emptyMessage: string;
  addButtonText: string;
  onItemChange: (type: 'headers' | 'params', index: number, field: 'key' | 'value', val: string) => void;
  onAddItem: (type: 'headers' | 'params') => void;
  onRemoveItem: (type: 'headers' | 'params', index: number) => void;
}

export const EndpointEditorKeyValueTab = ({ 
  value, 
  items, 
  type, 
  emptyMessage, 
  addButtonText, 
  onItemChange, 
  onAddItem, 
  onRemoveItem 
}: EndpointEditorKeyValueTabProps) => {
  return (
    <TabsContent value={value} className="h-full m-0 data-[state=active]:flex flex-col gap-2">
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ResponsiveTable
            data={items}
            keyExtractor={(_, i) => String(i)}
            emptyMessage={emptyMessage}
            columns={[
              {
                header: "Key",
                className: "w-[40%]",
                cell: (h: any, i: number) => (
                  <div className="p-2 border-r border-slate-200 dark:border-slate-800 h-full flex items-center">
                    <Input 
                      value={h.key} 
                      onChange={(e) => onItemChange(type, i, 'key', e.target.value)} 
                      className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                      placeholder="Key..."
                    />
                  </div>
                )
              },
              {
                header: "Value",
                className: "w-[50%]",
                cell: (h: any, i: number) => (
                  <div className="p-2 h-full flex items-center">
                    <Input 
                      value={h.value} 
                      onChange={(e) => onItemChange(type, i, 'value', e.target.value)} 
                      className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                      placeholder="Value..."
                    />
                  </div>
                )
              },
              {
                header: "",
                className: "w-[10%] text-center",
                cell: (h: any, i: number) => (
                  <div className="p-2 text-center">
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(type, i)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
        <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
          <Button variant="outline" size="sm" onClick={() => onAddItem(type)} className="w-full text-xs h-8 border-dashed">
            <Plus className="w-4 h-4 mr-1" /> {addButtonText}
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
