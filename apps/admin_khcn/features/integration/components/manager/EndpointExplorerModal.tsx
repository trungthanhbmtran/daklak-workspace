/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Plug, Save, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IntegrationConfig, useUpdateIntegration } from "../../api";
import { previewReport } from "../../../reports/api";
import { toast } from "sonner";
import { ParsedEndpoint } from "./EndpointTypes";
import { EndpointSidebar } from "./EndpointSidebar";
import { EndpointEditor } from "./EndpointEditor";
import { ResponseViewer } from "./ResponseViewer";

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

  // Test API state
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

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

  const handleDeleteEndpoint = useCallback((id: string) => {
    setEndpoints(prev => {
      const filtered = prev.filter(ep => ep.id !== id);
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [selectedId]);

  const selectedEndpoint = endpoints.find(ep => ep.id === selectedId);

  const handleTestEndpoint = useCallback(async () => {
    if (!integration || !selectedEndpoint) return;
    
    setIsTesting(true);
    setTestResult(null);
    setTestModalOpen(true);

    try {
      // Build headers & params object
      const headersMap: Record<string, string> = {};
      
      if (Array.isArray(integration.headers)) {
        integration.headers.forEach((h: any) => {
          if (h.key && h.value) headersMap[h.key.trim()] = h.value.trim();
        });
      } else if (typeof integration.headers === 'object' && integration.headers !== null) {
        Object.entries(integration.headers).forEach(([k, v]) => {
          headersMap[k.trim()] = String(v).trim();
        });
      }
      
      selectedEndpoint.headers?.forEach(h => {
        if (h.key && h.value) headersMap[h.key.trim()] = h.value.trim();
      });
      const paramsMap: Record<string, string> = {};
      selectedEndpoint.params?.forEach(p => {
        if (p.key && p.value) paramsMap[p.key.trim()] = p.value.trim();
      });

      let parsedBody: any = undefined;
      if (selectedEndpoint.body) {
        try {
          parsedBody = JSON.parse(selectedEndpoint.body);
        } catch (e) {
          parsedBody = selectedEndpoint.body; // Fallback to raw string if not JSON
        }
      }

      const payload = {
        baseUrl: integration.baseUrl,
        endpointPath: selectedEndpoint.path,
        method: selectedEndpoint.method || 'GET',
        headers: headersMap,
        authType: integration.authType,
        authConfig: integration.authConfig,
        params: paramsMap,
        body: parsedBody
      };

      const res = await previewReport(payload);
      setTestResult(res);
    } catch (err: any) {
      setTestResult(err.response?.data || {
        success: false,
        status: err.response?.status || 500,
        statusText: err.response?.statusText || "Error",
        error: err.response?.data?.message || err.message || "Lỗi khi gọi API"
      });
    } finally {
      setIsTesting(false);
    }
  }, [integration, selectedEndpoint]);

  return (
    <>
    {isOpen && (
          <ResponsiveModal
                open={isOpen}
                onOpenChange={setIsOpen}
                maxWidth="max-w-full"
                contentClassName="!w-screen !h-[100dvh] sm:!h-[100dvh] !max-w-none !rounded-none sm:!rounded-none !border-0 !m-0 !p-0 [&>div]:!max-h-[100dvh] [&>div]:!border-0 [&>div]:!rounded-none"
                icon={<Plug className="w-6 h-6 text-violet-500" />}
                title={`Quản lý Endpoints - ${integration?.name}`}
                description={`Trích xuất từ cấu hình ${integration?.code} (${endpoints.length} APIs)`}
                bodyClassName="p-0 bg-slate-50/50 dark:bg-slate-900/50 flex-1 overflow-hidden flex flex-col"
                footer={
                  <div className="w-full flex justify-end">
                    <Button 
                      onClick={handleSave} 
                      disabled={updateMutation.isPending}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                     iconStart={<Save className="w-4 h-4" />}>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Button>
                  </div>
                }
                fullHeight={true}
              >
                <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
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
                    onDelete={() => selectedId && handleDeleteEndpoint(selectedId)}
                    onTest={handleTestEndpoint}
                  />
                </div>
              </ResponsiveModal>
          )}

    <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <DialogTitle>Test API: {selectedEndpoint?.name}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{integration?.baseUrl}{selectedEndpoint?.path}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950">
          <ResponseViewer result={testResult} isLoading={isTesting} />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
});

EndpointExplorerModal.displayName = "EndpointExplorerModal";
