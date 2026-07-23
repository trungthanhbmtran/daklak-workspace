/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Node, Edge } from "@xyflow/react";
import { Settings2, Trash2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// Import all specific property panels
import {
  BaseProperties,
  EdgeProperties,
  UserTaskProperties,
  ScriptTaskProperties,
  GatewayProperties,
  ServiceTaskProperties,
  NginxProxyProperties,
  ApiGatewayProperties,
  ExternalSystemProperties
} from "./properties-panels";

interface PropertiesPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  availableServices?: any[];
  availableTriggers?: any[];
  taskRoles?: any[];
  /** Vị trí/chức danh tổ chức từ DB (JobTitle) — thay thế SYSTEM_ROLES hardcode */
  orgRoles?: { code: string; name: string; rank?: number; authorityLevel?: string; category?: string }[];
  onUpdate: (id: string, data: any) => void;
  onUpdateEdge?: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onDeleteEdge?: (id: string) => void;
  onClose: () => void;
  workflowDesc: string;
  setWorkflowDesc: (desc: string) => void;
  workflowCode: string;
  setWorkflowCode: (code: string) => void;
}

export const PropertiesPanel = ({
  isOpen,
  onOpenChange,
  selectedNode,
  selectedEdge,
  availableServices = [],
  // eslint-disable-next-line unused-imports/no-unused-vars
  availableTriggers = [],
  taskRoles = [],
  orgRoles = [],
  onUpdate,
  onUpdateEdge,
  onDelete,
  onDeleteEdge,
  // eslint-disable-next-line unused-imports/no-unused-vars
  onClose,
  workflowDesc,
  setWorkflowDesc,
  workflowCode,
  setWorkflowCode
}: PropertiesPanelProps) => {
  const data = selectedNode ? (selectedNode.data || {}) as any : (selectedEdge ? selectedEdge : {} as any);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = (e.target as any).type === "checkbox";
    const finalValue = isCheckbox ? (e.target as HTMLInputElement).checked : value;
    
    if (selectedNode) {
      onUpdate(selectedNode.id, { ...data, [name]: finalValue });
    } else if (selectedEdge && onUpdateEdge) {
      if (name === "label") {
        onUpdateEdge(selectedEdge.id, { ...selectedEdge, label: finalValue });
      } else {
        onUpdateEdge(selectedEdge.id, { ...selectedEdge, data: { ...(selectedEdge.data || {}), [name]: finalValue } });
      }
    }
  };

  const renderFields = () => {
    if (!selectedNode && !selectedEdge) {
      return (
        <BaseProperties
          workflowCode={workflowCode}
          setWorkflowCode={setWorkflowCode}
          workflowDesc={workflowDesc}
          setWorkflowDesc={setWorkflowDesc}
        />
      );
    }

    if (selectedEdge) {
      return (
        <EdgeProperties
          data={data}
          handleChange={handleChange}
          selectedEdge={selectedEdge}
          onUpdateEdge={onUpdateEdge}
        />
      );
    }

    if (!selectedNode) return null;
    
    const { type } = selectedNode;
    const commonProps = { data, handleChange, selectedNode, onUpdate, availableServices, taskRoles, orgRoles };

    switch (type) {
      case "user_task":
        return <UserTaskProperties {...commonProps} />;
      case "script_task":
        return <ScriptTaskProperties {...commonProps} />;
      case "parallel_gateway":
      case "exclusive_gateway":
        return <GatewayProperties {...commonProps} />;
      case "service_task":
        return <ServiceTaskProperties {...commonProps} />;
      case "nginx_proxy":
        return <NginxProxyProperties {...commonProps} />;
      case "api_gateway":
        return <ApiGatewayProperties {...commonProps} />;
      case "external_system":
        return <ExternalSystemProperties {...commonProps} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Node này không có thuộc tính cấu hình.</p>
          </div>
        );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange} modal={false}>
      <SheetContent 
        className="w-[320px] sm:w-[400px] border-l border-border bg-card p-0 flex flex-col shadow-2xl z-40"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on the React Flow canvas (nodes/edges)
          if ((e.target as Element).closest('.react-flow')) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/10">
          <div className="flex items-center gap-2">
            {(selectedNode || selectedEdge) ? <Settings2 className="h-4 w-4 text-primary" /> : <Activity className="h-4 w-4 text-primary" />}
            <h3 className="text-sm font-bold truncate max-w-[200px]">
              {selectedNode
                ? `${data.label || selectedNode.type}`
                : selectedEdge
                  ? `Đường nối (Edge)`
                  : "Cấu hình quy trình"}
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {selectedNode && (
            <div className="mb-6 pb-6 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Thông tin Node
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                <div className="text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded border border-border/80 shadow-sm">
                  #{selectedNode.id.slice(-6)}
                </div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                  {selectedNode.type}
                </div>
              </div>
            </div>
          )}
          {selectedEdge && (
            <div className="mb-6 pb-6 border-b border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
                Thông tin Đường nối
              </label>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
                <div className="text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded border border-border/80 shadow-sm">
                  #{selectedEdge.id.slice(-6)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                  {selectedEdge.source.slice(-6)} → {selectedEdge.target.slice(-6)}
                </div>
              </div>
            </div>
          )}

          {renderFields()}
        </div>

        {(selectedNode || selectedEdge) && (
          <div className="p-4 border-t border-border/60 bg-muted/5 flex items-center justify-between gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 rounded-xl"
              onClick={() => {
                if (selectedNode) onDelete(selectedNode.id);
                else if (selectedEdge && onDeleteEdge) onDeleteEdge(selectedEdge.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Xóa {selectedNode ? 'bước này' : 'đường nối này'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default PropertiesPanel;
