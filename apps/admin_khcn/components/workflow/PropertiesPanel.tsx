import React from "react";
import { Node } from "@xyflow/react";
import { 
  X, 
  Settings2, 
  Trash2, 
  Info,
  Type,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PropertiesPanelProps {
  selectedNode: Node | null;
  availableServices?: any[];
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const PropertiesPanel = ({ 
  selectedNode, 
  availableServices = [],
  onUpdate, 
  onDelete, 
  onClose 
}: PropertiesPanelProps) => {
  if (!selectedNode) return null;

  const { id, type } = selectedNode;
  const data = (selectedNode.data || {}) as any;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate(id, { ...data, [name]: value });
  };

  const renderFields = () => {
    switch (type) {
      case "user_task":
        return (
          <>
            <div className="space-y-4">
               <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Assignee Role
                </label>
                <select
                  name="role"
                  value={data.role || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select a role...</option>
                  <option value="Admin">Administrator</option>
                  <option value="Manager">Department Manager</option>
                  <option value="Staff">Specialist Staff</option>
                  <option value="External">External Expert</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Task Description
                </label>
                <textarea
                  name="description"
                  value={data.description || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder="Describe the user task..."
                />
              </div>
            </div>
          </>
        );
      case "condition":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Logic Expression
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors">
                     <span className="font-mono text-xs font-bold">fx</span>
                  </div>
                  <input
                    name="expression"
                    value={data.expression || ""}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg p-2.5 pl-10 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="e.g. status === 'approved'"
                  />
                </div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-800 leading-normal">
                    Conditions determine the workflow path. True values follow the primary connection.
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      case "service_task":
        return (
          <>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Action Type
                </label>
                <select
                  name="action"
                  value={data.action || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select action...</option>
                  <option value="Send Email">Send Notification Email</option>
                  <option value="HTTP Request">Call API Endoint</option>
                  <option value="Update Record">Database Sync</option>
                  <option value="Generate Doc">Create PDF Report</option>
                </select>
              </div>
               <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
                  Target Service
                </label>
                <select
                  name="service"
                  value={data.service || ""}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                  <option value="">Select target service...</option>
                  {availableServices.map((app) => (
                    <option key={app.id} value={app.title}>
                      {app.title}
                    </option>
                  ))}
                  <option value="External Service">External API</option>
                </select>
              </div>
            </div>
          </>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">This node type has no configurable properties.</p>
          </div>
        );
    }
  };

  return (
    <aside className={cn(
      "w-80 border-l border-border bg-card flex flex-col transition-all overflow-hidden",
      selectedNode ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold truncate max-w-[140px]">
             {(data as any).label || type} properties
          </h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
         <div className="mb-6 pb-6 border-b border-border/40">
           <label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
             Node Identification
           </label>
           <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
             <div className="text-[10px] font-mono font-bold bg-background px-2 py-0.5 rounded border border-border/80">
               ID-#{id.slice(-4)}
             </div>
             <div className="text-[10px] uppercase font-bold text-muted-foreground/60">
               {type}
             </div>
           </div>
         </div>

        {renderFields()}
      </div>

      <div className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-3.5 w-3.5 mr-2" />
          Delete Node
        </Button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
