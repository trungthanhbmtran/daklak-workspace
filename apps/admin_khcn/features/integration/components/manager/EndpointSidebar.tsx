"use client";

import React, { memo } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ParsedEndpoint, getMethodColor } from "./EndpointTypes";

interface EndpointSidebarProps {
  endpoints: ParsedEndpoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  search: string;
  setSearch: (val: string) => void;
}

const areSidebarPropsEqual = (prev: EndpointSidebarProps, next: EndpointSidebarProps) => {
  if (prev.selectedId !== next.selectedId) return false;
  if (prev.search !== next.search) return false;
  if (prev.endpoints.length !== next.endpoints.length) return false;
  for (let i = 0; i < prev.endpoints.length; i++) {
    const p = prev.endpoints[i];
    const n = next.endpoints[i];
    if (p.id !== n.id || p.name !== n.name || p.path !== n.path || p.method !== n.method) return false;
  }
  return true;
};

export const EndpointSidebar = memo(({ endpoints, selectedId, onSelect, onAdd, search, setSearch }: EndpointSidebarProps) => {
  const filteredEndpoints = endpoints.filter(ep => 
    ep.name.toLowerCase().includes(search.toLowerCase()) || 
    ep.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/20">
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm API..." 
            className="pl-9 h-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {filteredEndpoints.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Không tìm thấy API nào</div>
        ) : (
          filteredEndpoints.map(ep => (
            <button
              key={ep.id}
              onClick={() => onSelect(ep.id)}
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
  );
}, areSidebarPropsEqual);

EndpointSidebar.displayName = "EndpointSidebar";
