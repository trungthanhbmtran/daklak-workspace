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
import { PropertiesHeader } from "./properties-panels/PropertiesHeader";
import { PropertiesItemInfo } from "./properties-panels/PropertiesItemInfo";

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
        className="w-[320px] sm:w-[400px] border-l border-border bg-card p-0 flex flex-col shadow-2xl z-50"
        onPointerDownOutside={(e) => {
          if ((e.target as Element).closest('.react-flow')) {
            e.preventDefault();
          }
        }}
      >
        <PropertiesHeader selectedNode={selectedNode} selectedEdge={selectedEdge} data={data} />

        <div className="flex-1 overflow-y-auto p-5">
          <PropertiesItemInfo selectedNode={selectedNode} selectedEdge={selectedEdge} />
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
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa {selectedNode ? "Node" : "Edge"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
