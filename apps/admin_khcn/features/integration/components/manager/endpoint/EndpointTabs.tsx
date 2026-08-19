import React, { memo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParsedEndpoint } from "../EndpointTypes";
import { EndpointEditorKeyValueTab } from "./EndpointEditorKeyValueTab";
import { EndpointBodyTab } from "./EndpointBodyTab";

interface EndpointTabsProps {
  selectedEndpoint: ParsedEndpoint;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onItemChange: (type: 'headers' | 'params' | 'formItems', index: number, field: 'key' | 'value' | 'description' | 'enabled', val: any) => void;
  onAddItem: (type: 'headers' | 'params' | 'formItems') => void;
  onRemoveItem: (type: 'headers' | 'params' | 'formItems', index: number) => void;
}

export const EndpointTabs = memo(({
  selectedEndpoint,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem
}: EndpointTabsProps) => {
  return (
    <div className="flex-1 overflow-hidden p-4 min-w-0 flex flex-col">
      <Tabs defaultValue="params" className="w-full h-full flex flex-col min-w-0">
        <TabsList className="w-fit bg-slate-100 dark:bg-slate-900">
          <TabsTrigger value="params">Params ({selectedEndpoint.params?.length || 0})</TabsTrigger>
          <TabsTrigger value="headers">Headers ({selectedEndpoint.headers?.length || 0})</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden mt-4 min-w-0">
          <EndpointEditorKeyValueTab
            value="params"
            type="params"
            items={selectedEndpoint.params || []}
            emptyMessage="Không có Query Params"
            addButtonText="Thêm Query Param"
            onAddItem={onAddItem}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
          />

          <EndpointEditorKeyValueTab
            value="headers"
            type="headers"
            items={selectedEndpoint.headers || []}
            emptyMessage="Không có Headers"
            addButtonText="Thêm Header"
            onAddItem={onAddItem}
            onItemChange={onItemChange}
            onRemoveItem={onRemoveItem}
          />

          <EndpointBodyTab
            selectedEndpoint={selectedEndpoint}
            onChange={onChange}
            onItemChange={onItemChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
          />
        </div>
      </Tabs>
    </div>
  );
});

EndpointTabs.displayName = "EndpointTabs";
