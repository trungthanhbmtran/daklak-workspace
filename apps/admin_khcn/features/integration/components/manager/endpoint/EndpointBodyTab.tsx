import React, { memo } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ParsedEndpoint } from "../EndpointTypes";
import { EndpointEditorKeyValueTab } from "./EndpointEditorKeyValueTab";

interface EndpointBodyTabProps {
  selectedEndpoint: ParsedEndpoint;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onItemChange: (type: 'headers' | 'params' | 'formItems', index: number, field: 'key' | 'value' | 'description' | 'enabled', val: any) => void;
  onAddItem: (type: 'headers' | 'params' | 'formItems') => void;
  onRemoveItem: (type: 'headers' | 'params' | 'formItems', index: number) => void;
}

export const EndpointBodyTab = memo(({
  selectedEndpoint,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem
}: EndpointBodyTabProps) => {
  return (
    <TabsContent value="body" className="h-full m-0 data-[state=active]:flex flex-col">
      {/* Body Type Radio Row */}
      <div className="flex items-center gap-4 mb-3 text-sm text-slate-400">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input 
            type="radio" 
            name="bodyType" 
            value="none" 
            checked={!selectedEndpoint.bodyType || selectedEndpoint.bodyType === 'none'} 
            onChange={(e) => onChange('bodyType', e.target.value)}
            className="accent-violet-500"
          />
          none
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input 
            type="radio" 
            name="bodyType" 
            value="form-data" 
            checked={selectedEndpoint.bodyType === 'form-data'} 
            onChange={(e) => onChange('bodyType', e.target.value)}
            className="accent-violet-500"
          />
          form-data
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input 
            type="radio" 
            name="bodyType" 
            value="x-www-form-urlencoded" 
            checked={selectedEndpoint.bodyType === 'x-www-form-urlencoded'} 
            onChange={(e) => onChange('bodyType', e.target.value)}
            className="accent-violet-500"
          />
          x-www-form-urlencoded
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
          <input 
            type="radio" 
            name="bodyType" 
            value="raw" 
            checked={selectedEndpoint.bodyType === 'raw' || !!(selectedEndpoint.body && !selectedEndpoint.bodyType)} 
            onChange={(e) => onChange('bodyType', e.target.value)}
            className="accent-violet-500"
          />
          raw
        </label>
      </div>

      <div className="bg-slate-900 rounded-xl flex-1 overflow-hidden border border-slate-800 p-1 flex">
        {(!selectedEndpoint.bodyType || selectedEndpoint.bodyType === 'none') && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            This request does not have a body
          </div>
        )}
        {(selectedEndpoint.bodyType === 'raw' || !!(selectedEndpoint.body && !selectedEndpoint.bodyType)) && (
          <Textarea
            className="flex-1 resize-none bg-transparent border-0 text-slate-300 font-mono text-sm focus-visible:ring-0 custom-scrollbar p-3"
            value={selectedEndpoint.body || ''}
            onChange={(e) => onChange('body', e.target.value)}
            placeholder="Nhập JSON body..."
            spellCheck={false}
          />
        )}
        {(selectedEndpoint.bodyType === 'form-data' || selectedEndpoint.bodyType === 'x-www-form-urlencoded') && (
          <div className="flex-1 w-full flex flex-col bg-slate-950 p-2 overflow-hidden">
            <EndpointEditorKeyValueTab
              value="body"
              type="formItems"
              items={selectedEndpoint.formItems || []}
              emptyMessage="Không có Form Data"
              addButtonText="Thêm Key"
              onAddItem={onAddItem}
              onItemChange={onItemChange}
              onRemoveItem={onRemoveItem}
              hideTabsContent={true}
            />
          </div>
        )}
      </div>
    </TabsContent>
  );
});

EndpointBodyTab.displayName = "EndpointBodyTab";
