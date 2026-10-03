/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { Plug, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { IntegrationConfig, useUpdateIntegration } from "../../api";
import { toast } from "sonner";
import { ParsedEndpoint } from "./EndpointTypes";
import { EndpointSidebar } from "./EndpointSidebar";
import { EndpointEditor } from "./EndpointEditor";
import { ResponseViewer } from "./ResponseViewer";
import { useEndpointManager } from "../../hooks/useEndpointManager";

export interface EndpointExplorerModalRef {
  open: (item: IntegrationConfig) => void;
}

export const EndpointExplorerModal = forwardRef<EndpointExplorerModalRef>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [integration, setIntegration] = useState<IntegrationConfig | null>(null);
  const [initialEndpoints, setInitialEndpoints] = useState<ParsedEndpoint[]>([]);
  const [search, setSearch] = useState("");
  const updateMutation = useUpdateIntegration();

  const {
    endpoints,
    selectedId,
    selectedEndpoint,
    testModalOpen,
    setTestModalOpen,
    isTesting,
    testResult,
    handleEndpointChange,
    handleItemChange,
    handleAddItem,
    handleRemoveItem,
    handleSelect,
    handleAddEndpoint,
    handleDeleteEndpoint,
    handleTestEndpoint
  } = useEndpointManager({ initialEndpoints, integration });

  const handleSave = useCallback(() => {
    if (!integration) return;
    try {
      const parsed = integration.metadata || {};
      parsed._parsedEndpoints = endpoints;
      
      updateMutation.mutate({
        ...integration,
        endpoints: endpoints,
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
        const parsedEndpoints: ParsedEndpoint[] = Array.isArray(parsed._parsedEndpoints) 
          ? parsed._parsedEndpoints 
          : (Array.isArray(item.endpoints) ? item.endpoints : []);
        setInitialEndpoints(parsedEndpoints);
      } catch (e) {
        setInitialEndpoints([]);
      }
      setIsOpen(true);
    }
  }));

  return (
    <>
    {isOpen && (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[95vw] sm:max-w-[95vw] z-[99999] p-0 flex flex-col gap-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <SheetHeader className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950 text-left">
            <div className="flex justify-between items-center w-full">
              <div>
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <Plug className="w-5 h-5 text-violet-500" />
                  Quản lý Endpoints - {integration?.name}
                </SheetTitle>
                <SheetDescription className="mt-1 text-sm text-slate-500">
                  Trích xuất từ cấu hình {integration?.code} ({endpoints.length} APIs)
                </SheetDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSave} 
                  disabled={updateMutation.isPending}
                 className="min-w-[120px]">
                   {updateMutation.isPending ? "Đang lưu..." : (
                     <>
                       <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                     </>
                   )}
                 </Button>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden flex flex-col p-0">
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
                isTesting={isTesting}
                baseUrl={integration?.baseUrl}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )}

      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#0d1117] border-slate-800">
          <DialogHeader className="p-4 border-b border-slate-800 shrink-0 bg-slate-950">
            <DialogTitle className="text-slate-200">Test API: {selectedEndpoint?.name}</DialogTitle>
            <DialogDescription className="font-mono text-xs text-slate-400 mt-1">{integration?.baseUrl}{selectedEndpoint?.path}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col bg-[#0d1117]">
            <ResponseViewer result={testResult} isLoading={isTesting} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

EndpointExplorerModal.displayName = "EndpointExplorerModal";
