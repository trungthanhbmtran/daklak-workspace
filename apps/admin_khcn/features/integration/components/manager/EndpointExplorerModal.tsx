"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Plug, X, Search, ChevronRight, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationConfig } from "../../api";

export interface EndpointExplorerModalRef {
  open: (item: IntegrationConfig) => void;
}

interface ParsedEndpoint {
  id: string;
  name: string;
  folder: string;
  method: string;
  path: string;
  headers: Array<{ key: string; value: string }>;
  params: Array<{ key: string; value: string }>;
  body: string;
}

const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'POST': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'PUT': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
    case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    case 'PATCH': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

export const EndpointExplorerModal = forwardRef<EndpointExplorerModalRef>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [integration, setIntegration] = useState<IntegrationConfig | null>(null);
  const [endpoints, setEndpoints] = useState<ParsedEndpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useImperativeHandle(ref, () => ({
    open: (item: IntegrationConfig) => {
      setIntegration(item);
      try {
        const parsed = JSON.parse(item.configData || "{}");
        const ep = parsed._parsedEndpoints || [];
        setEndpoints(ep);
        setSelectedId(ep.length > 0 ? ep[0].id : null);
      } catch (e) {
        setEndpoints([]);
        setSelectedId(null);
      }
      setSearch("");
      setIsOpen(true);
    }
  }));

  const handleClose = () => setIsOpen(false);

  const filteredEndpoints = endpoints.filter(ep => 
    ep.name.toLowerCase().includes(search.toLowerCase()) || 
    ep.path.toLowerCase().includes(search.toLowerCase())
  );

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedId);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[1200px] w-[95vw] h-[85vh] p-0 overflow-hidden border-0 bg-transparent shadow-2xl flex flex-col">
        <div className="bg-white dark:bg-slate-950 flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800">
          
          <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Plug className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Quản lý Endpoints - {integration?.systemName}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Trích xuất từ cấu hình {integration?.integrationCode} ({endpoints.length} APIs)
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - API List */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/20">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Tìm kiếm API..." 
                    className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredEndpoints.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">Không tìm thấy API nào</div>
                ) : (
                  filteredEndpoints.map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => setSelectedId(ep.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex flex-col gap-1.5 transition-colors ${
                        selectedId === ep.id 
                          ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-900 dark:text-violet-100 border border-violet-200 dark:border-violet-800/50' 
                          : 'hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold tracking-wide border-0 ${getMethodColor(ep.method)}`}>
                          {ep.method}
                        </Badge>
                        <span className="font-semibold text-sm truncate">{ep.name}</span>
                      </div>
                      <div className="text-xs font-mono truncate opacity-70 ml-[38px]">{ep.path}</div>
                      {ep.folder && <div className="text-[10px] text-slate-400 uppercase tracking-wide ml-[38px]">{ep.folder}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Content - API Details */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
              {!selectedEndpoint ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <Server className="w-12 h-12 mb-4 opacity-20" />
                  <p>Chọn một API từ danh sách bên trái để xem chi tiết</p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  {/* Top Header URL */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">{selectedEndpoint.name}</h3>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 font-bold border-0 ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </Badge>
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300 break-all select-all">
                        {selectedEndpoint.path}
                      </span>
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
                        <TabsContent value="headers" className="h-full m-0 data-[state=active]:flex flex-col">
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 w-1/3">Key</th>
                                  <th className="px-4 py-3">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                {(!selectedEndpoint.headers || selectedEndpoint.headers.length === 0) ? (
                                  <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">Không có Headers</td></tr>
                                ) : (
                                  selectedEndpoint.headers.map((h, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                      <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">{h.key}</td>
                                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400 break-all">{h.value}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>

                        <TabsContent value="params" className="h-full m-0 data-[state=active]:flex flex-col">
                          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex-1">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                  <th className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 w-1/3">Key</th>
                                  <th className="px-4 py-3">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                                {(!selectedEndpoint.params || selectedEndpoint.params.length === 0) ? (
                                  <tr><td colSpan={2} className="px-4 py-8 text-center text-slate-400">Không có Query Params</td></tr>
                                ) : (
                                  selectedEndpoint.params.map((p, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                      <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300">{p.key}</td>
                                      <td className="px-4 py-2 font-mono text-slate-600 dark:text-slate-400 break-all">{p.value}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </TabsContent>

                        <TabsContent value="body" className="h-full m-0 data-[state=active]:flex flex-col">
                          {selectedEndpoint.body ? (
                            <div className="bg-slate-900 rounded-xl flex-1 overflow-hidden border border-slate-800">
                              <pre className="p-4 text-sm text-slate-300 font-mono w-full h-full overflow-auto custom-scrollbar">
                                {selectedEndpoint.body}
                              </pre>
                            </div>
                          ) : (
                            <div className="flex-1 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900/20">
                              Không có Body
                            </div>
                          )}
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

EndpointExplorerModal.displayName = "EndpointExplorerModal";
