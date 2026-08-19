/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Server } from "lucide-react";
import { ParsedEndpoint } from "./EndpointTypes";
import { EndpointHeader } from "./endpoint/EndpointHeader";
import { EndpointTabs } from "./endpoint/EndpointTabs";

interface EndpointEditorProps {
  selectedEndpoint: ParsedEndpoint | undefined;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onItemChange: (type: 'headers' | 'params' | 'formItems', index: number, field: 'key' | 'value' | 'description' | 'enabled', val: any) => void;
  onAddItem: (type: 'headers' | 'params' | 'formItems') => void;
  onRemoveItem: (type: 'headers' | 'params' | 'formItems', index: number) => void;
  onDelete: () => void;
  onTest?: () => void;
  isTesting?: boolean;
  baseUrl?: string;
}

export const EndpointEditor = memo(({
  selectedEndpoint,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onDelete,
  onTest,
  isTesting,
  baseUrl
}: EndpointEditorProps) => {

  if (!selectedEndpoint) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden items-center justify-center text-slate-400">
        <Server className="w-12 h-12 mb-4 opacity-20" />
        <p>Chọn một API từ danh sách bên trái để xem chi tiết</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden min-w-0 h-full">
      {/* Top Half: Request Config */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-h-[50%] border-b border-slate-200 dark:border-slate-800">
        <EndpointHeader
          selectedEndpoint={selectedEndpoint}
          onChange={onChange}
          onDelete={onDelete}
          onTest={onTest}
          isTesting={isTesting}
          baseUrl={baseUrl}
        />
        <EndpointTabs
          selectedEndpoint={selectedEndpoint}
          onChange={onChange}
          onItemChange={onItemChange}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
      </div>
    </div>
  );
});

EndpointEditor.displayName = "EndpointEditor";
