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
        const parsedEndpoints: ParsedEndpoint[] = Array.isArray(parsed._parsedEndpoints) ? parsed._parsedEndpoints : [];
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
                    isTesting={isTesting}
                    baseUrl={integration?.baseUrl}
                  />
                </div>
              </ResponsiveModal>
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
