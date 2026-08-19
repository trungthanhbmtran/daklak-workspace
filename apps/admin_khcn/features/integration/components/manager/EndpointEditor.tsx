/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Server, Trash2, Loader2, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ParsedEndpoint, getMethodColor } from "./EndpointTypes";
import { EndpointEditorKeyValueTab } from "./endpoint/EndpointEditorKeyValueTab";

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
                <Button variant="outline" size="sm" onClick={onTest} disabled={isTesting} className="text-violet-600 border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:hover:bg-violet-900/30 shrink-0 h-8" title="Test API">
                  {isTesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />} Test
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
          <div className="flex items-center gap-0 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <Select
              value={selectedEndpoint.method}
              onValueChange={(val) => onChange('method', val)}
            >
              <SelectTrigger className={`w-[100px] h-10 text-sm font-bold border-0 bg-transparent rounded-none focus:ring-0 ${getMethodColor(selectedEndpoint.method)}`}>
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

            <div className="flex-1 flex items-center bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 px-3 min-w-0 h-10">
              {baseUrl && (
                <span className="text-sm text-slate-500 shrink-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={baseUrl}>
                  {baseUrl}
                </span>
              )}
              <Input
                value={selectedEndpoint.path}
                onChange={(e) => onChange('path', e.target.value)}
                placeholder="/api/v1/..."
                className="font-mono text-sm h-full bg-transparent border-0 focus-visible:ring-0 px-1 min-w-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                      checked={selectedEndpoint.bodyType === 'raw' || (selectedEndpoint.body && !selectedEndpoint.bodyType)} 
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
                  {(selectedEndpoint.bodyType === 'raw' || (selectedEndpoint.body && !selectedEndpoint.bodyType)) && (
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
            </div>
          </Tabs>
        </div>
      </div>

    </div>
  );
});

EndpointEditor.displayName = "EndpointEditor";
