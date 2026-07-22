/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Plug, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
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
      const parsed = integration.metadata || {};
      parsed._parsedEndpoints = endpoints;
      
      updateMutation.mutate({
        ...integration,
        metadata: parsed
      }, {
        onSuccess: () => {
          toast.success("Đã lưu các Endpoints thành công");
          setIntegration({ ...integration, metadata: parsed });
        },
        onError: (err: any) => toast.error(err.message || "Lỗi khi lưu Endpoints")
      });
     
    } catch (e) {
      toast.error((e as any)?.response?.data?.message || "Lỗi dữ liệu cấu hình");
    }
  }, [integration, endpoints, updateMutation]);

  useImperativeHandle(ref, () => ({
    open: (item: IntegrationConfig) => {
      setIntegration(item);
      try {
        const parsed = item.metadata || {};
        const ep = parsed._parsedEndpoints || [];
        setEndpoints(ep);
        setSelectedId(ep.length > 0 ? ep[0].id : null);
      // eslint-disable-next-line unused-imports/no-unused-vars
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
    <ResponsiveModal
      open={isOpen}
      onOpenChange={setIsOpen}
      maxWidth="max-w-7xl"
      fullHeight={true}
      icon={<Plug className="w-6 h-6 text-violet-500" />}
      title={`Quản lý Endpoints - ${integration?.name}`}
      description={`Trích xuất từ cấu hình ${integration?.code} (${endpoints.length} APIs)`}
      bodyClassName="p-0 bg-slate-50/50 dark:bg-slate-900/50"
      footer={
        <div className="w-full flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700 text-white"
           iconStart={<Save className="w-4 h-4" />}>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row h-full">
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
    </ResponsiveModal>
  );
});

EndpointExplorerModal.displayName = "EndpointExplorerModal";
