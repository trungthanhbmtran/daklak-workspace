/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Server, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ParsedEndpoint, getMethodColor } from "./EndpointTypes";
import { EndpointEditorKeyValueTab } from "./endpoint/EndpointEditorKeyValueTab";

interface EndpointEditorProps {
  selectedEndpoint: ParsedEndpoint | undefined;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onItemChange: (type: 'headers' | 'params', index: number, field: 'key' | 'value', val: string) => void;
  onAddItem: (type: 'headers' | 'params') => void;
  onRemoveItem: (type: 'headers' | 'params', index: number) => void;
  onDelete: () => void;
  onTest?: () => void;
}

export const EndpointEditor = memo(({
  selectedEndpoint,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onDelete,
  onTest
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
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden min-w-0">
      <div className="flex flex-col h-full min-w-0">
        {/* Top Header URL */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              value={selectedEndpoint.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="font-bold text-lg text-slate-800 dark:text-slate-100 h-auto py-1.5 px-2 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus-visible:ring-1 flex-1 min-w-0"
              placeholder="Tên API..."
            />
            <div className="flex gap-1 shrink-0">
              {onTest && (
                <Button variant="outline" size="sm" onClick={onTest} className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/30 shrink-0 h-8" title="Test API">
                  <Play className="w-4 h-4 mr-2" /> Test
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shrink-0 h-8 w-8" title="Xóa Endpoint này">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Input
            value={selectedEndpoint.description || ""}
            onChange={(e) => onChange('description', e.target.value)}
            className="text-sm text-slate-500 h-auto py-1 px-2 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus-visible:ring-1 w-full"
            placeholder="Mô tả API..."
          />
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <Select
              value={selectedEndpoint.method}
              onValueChange={(val) => onChange('method', val)}
            >
              <SelectTrigger className={`w-[110px] h-8 text-xs font-bold border-0 ${getMethodColor(selectedEndpoint.method)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={selectedEndpoint.path}
              onChange={(e) => onChange('path', e.target.value)}
              placeholder="/api/v1/..."
              className="font-mono text-sm h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1 min-w-0"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden p-4 min-w-0">
          <Tabs defaultValue="headers" className="w-full h-full flex flex-col min-w-0">
            <TabsList className="w-fit bg-slate-100 dark:bg-slate-900">
              <TabsTrigger value="headers">Headers ({selectedEndpoint.headers?.length || 0})</TabsTrigger>
              <TabsTrigger value="params">Params ({selectedEndpoint.params?.length || 0})</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4 min-w-0">
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

              <TabsContent value="body" className="h-full m-0 data-[state=active]:flex flex-col">
                <div className="bg-slate-900 rounded-xl flex-1 overflow-hidden border border-slate-800 p-1 flex">
                  <Textarea
                    className="flex-1 resize-none bg-transparent border-0 text-slate-300 font-mono text-sm focus-visible:ring-0 custom-scrollbar p-3"
                    value={selectedEndpoint.body}
                    onChange={(e) => onChange('body', e.target.value)}
                    placeholder="Nhập JSON body..."
                    spellCheck={false}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
});

EndpointEditor.displayName = "EndpointEditor";
