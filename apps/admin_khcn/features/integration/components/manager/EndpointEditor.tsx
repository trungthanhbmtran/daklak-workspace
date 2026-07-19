/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Server, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveTable } from "@/components/shared/responsive-table";
import { ParsedEndpoint, getMethodColor } from "./EndpointTypes";

interface EndpointEditorProps {
  selectedEndpoint: ParsedEndpoint | undefined;
  onChange: (field: keyof ParsedEndpoint, value: any) => void;
  onItemChange: (type: 'headers' | 'params', index: number, field: 'key' | 'value', val: string) => void;
  onAddItem: (type: 'headers' | 'params') => void;
  onRemoveItem: (type: 'headers' | 'params', index: number) => void;
}

export const EndpointEditor = memo(({ 
  selectedEndpoint, 
  onChange, 
  onItemChange, 
  onAddItem, 
  onRemoveItem 
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
    <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Top Header URL */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
          <Input 
            value={selectedEndpoint.name} 
            onChange={(e) => onChange('name', e.target.value)}
            className="font-bold text-lg text-slate-800 dark:text-slate-100 h-auto py-1.5 px-2 bg-transparent border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus-visible:ring-1"
            placeholder="Tên API..."
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
              className="font-mono text-sm h-8 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-1"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden p-4">
          <Tabs defaultValue="headers" className="w-full h-full flex flex-col">
            <TabsList className="w-fit bg-slate-100 dark:bg-slate-900">
              <TabsTrigger value="headers">Headers ({selectedEndpoint.headers?.length || 0})</TabsTrigger>
              <TabsTrigger value="params">Params ({selectedEndpoint.params?.length || 0})</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <TabsContent value="headers" className="h-full m-0 data-[state=active]:flex flex-col gap-2">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ResponsiveTable
                      data={selectedEndpoint.headers || []}
                      keyExtractor={(_, i) => String(i)}
                      emptyMessage="Không có Headers"
                      columns={[
                        {
                          header: "Key",
                          className: "w-[40%]",
                          cell: (h: any, i: number) => (
                            <div className="p-2 border-r border-slate-200 dark:border-slate-800 h-full flex items-center">
                              <Input 
                                value={h.key} 
                                onChange={(e) => onItemChange('headers', i, 'key', e.target.value)} 
                                className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                                placeholder="Header key..."
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
                                onChange={(e) => onItemChange('headers', i, 'value', e.target.value)} 
                                className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                                placeholder="Header value..."
                              />
                            </div>
                          )
                        },
                        {
                          header: "",
                          className: "w-[10%] text-center",
                          cell: (h: any, i: number) => (
                            <div className="p-2 text-center">
                              <Button variant="ghost" size="icon" onClick={() => onRemoveItem('headers', i)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        }
                      ]}
                    />
                  </div>
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onAddItem('headers')} className="w-full text-xs h-8 border-dashed">
                      <Plus className="w-4 h-4 mr-1" /> Thêm Header
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="params" className="h-full m-0 data-[state=active]:flex flex-col gap-2">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <ResponsiveTable
                      data={selectedEndpoint.params || []}
                      keyExtractor={(_, i) => String(i)}
                      emptyMessage="Không có Query Params"
                      columns={[
                        {
                          header: "Key",
                          className: "w-[40%]",
                          cell: (p: any, i: number) => (
                            <div className="p-2 border-r border-slate-200 dark:border-slate-800 h-full flex items-center">
                              <Input 
                                value={p.key} 
                                onChange={(e) => onItemChange('params', i, 'key', e.target.value)} 
                                className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                                placeholder="Param key..."
                              />
                            </div>
                          )
                        },
                        {
                          header: "Value",
                          className: "w-[50%]",
                          cell: (p: any, i: number) => (
                            <div className="p-2 h-full flex items-center">
                              <Input 
                                value={p.value} 
                                onChange={(e) => onItemChange('params', i, 'value', e.target.value)} 
                                className="font-mono h-8 bg-transparent border-transparent hover:border-slate-200 focus-visible:ring-1" 
                                placeholder="Param value..."
                              />
                            </div>
                          )
                        },
                        {
                          header: "",
                          className: "w-[10%] text-center",
                          cell: (p: any, i: number) => (
                            <div className="p-2 text-center">
                              <Button variant="ghost" size="icon" onClick={() => onRemoveItem('params', i)} className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        }
                      ]}
                    />
                  </div>
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onAddItem('params')} className="w-full text-xs h-8 border-dashed">
                      <Plus className="w-4 h-4 mr-1" /> Thêm Query Param
                    </Button>
                  </div>
                </div>
              </TabsContent>

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
