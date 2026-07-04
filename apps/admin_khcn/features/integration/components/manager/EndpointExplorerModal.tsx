"use client";

import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Plug, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IntegrationConfig, useUpdateIntegration } from "../../api";
import { toast } from "sonner";
import { ParsedEndpoint } from "./EndpointTypes";
import { EndpointSidebar } from "./EndpointSidebar";
import { EndpointEditor } from "./EndpointEditor";

export interface EndpointExplorerModalRef {
  open: (item: IntegrationConfig) => void;
}

export const EndpointExplorerModal = forwardRef<EndpointExplorerModalRef>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [integration, setIntegration] = useState<IntegrationConfig | null>(null);
  const [endpoints, setEndpoints] = useState<ParsedEndpoint[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const updateMutation = useUpdateIntegration();

  const handleSave = useCallback(() => {
    if (!integration) return;
    try {
      const parsed = JSON.parse(integration.configData || "{}");
      parsed._parsedEndpoints = endpoints;
      const newConfigData = JSON.stringify(parsed);
      
      updateMutation.mutate({
        ...integration,
        configData: newConfigData
      }, {
        onSuccess: () => {
          toast.success("Đã lưu các Endpoints thành công");
          setIntegration({ ...integration, configData: newConfigData });
        },
        onError: (err: any) => toast.error(err.message || "Lỗi khi lưu Endpoints")
      });
    } catch (e) {
      toast.error("Lỗi dữ liệu cấu hình");
    }
  }, [integration, endpoints, updateMutation]);

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

  const handleEndpointChange = useCallback((field: keyof ParsedEndpoint, value: any) => {
    setEndpoints(prev => prev.map(ep => 
      ep.id === selectedId ? { ...ep, [field]: value } : ep
    ));
  }, [selectedId]);

  const handleItemChange = useCallback((type: 'headers' | 'params', index: number, field: 'key' | 'value', val: string) => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || [])];
      items[index] = { ...items[index], [field]: val };
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);
  
  const handleAddItem = useCallback((type: 'headers' | 'params') => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || []), { key: '', value: '' }];
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);

  const handleRemoveItem = useCallback((type: 'headers' | 'params', index: number) => {
    setEndpoints(prev => {
      const ep = prev.find(e => e.id === selectedId);
      if (!ep) return prev;
      const items = [...(ep[type] || [])];
      items.splice(index, 1);
      return prev.map(e => e.id === selectedId ? { ...e, [type]: items } : e);
    });
  }, [selectedId]);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const handleAddEndpoint = useCallback(() => {
    const newId = Math.random().toString(36).substring(2, 11);
    setEndpoints(prev => [{
      id: newId,
      name: "New Request",
      folder: "",
      method: "GET",
      path: "/",
      headers: [],
      params: [],
      body: ""
    }, ...prev]);
    setSelectedId(newId);
  }, []);

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
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white mr-8"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            <EndpointSidebar 
              endpoints={endpoints}
              selectedId={selectedId}
              search={search}
              setSearch={setSearch}
              onSelect={handleSelect}
              onAdd={handleAddEndpoint}
            />

            <EndpointEditor 
              selectedEndpoint={selectedEndpoint}
              onChange={handleEndpointChange}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

EndpointExplorerModal.displayName = "EndpointExplorerModal";
