import React from "react";
import { 
  Play, 
  UserCheck, 
  Split, 
  CircleStop,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_TYPES = [
  { type: "start", label: "Bắt đầu", icon: Play, color: "text-primary", bgColor: "bg-primary/10" },
  { type: "user_task", label: "Bước xử lý", icon: UserCheck, color: "text-primary", bgColor: "bg-primary/10" },
  { type: "exclusive_gateway", label: "Điều kiện rẽ nhánh", icon: Split, color: "text-destructive", bgColor: "bg-destructive/10" },
  // Ẩn các Node nâng cao để đơn giản hóa giao diện
  // { type: "parallel_gateway", label: "Parallel Gateway", icon: Split, color: "text-destructive", bgColor: "bg-destructive/10" },
  // { type: "service_task", label: "Action", icon: Zap, color: "text-violet-500", bgColor: "bg-violet-50" },
  // { type: "script_task", label: "Script Task", icon: Zap, color: "text-purple-500", bgColor: "bg-purple-50" },
  { type: "end", label: "Kết thúc", icon: CircleStop, color: "text-muted-foreground", bgColor: "bg-muted" },
];

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NodePaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NodePalette = ({ isOpen, onClose }: NodePaletteProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
    
    // Auto-close palette on mobile when drag starts? 
    // Actually, letting them drag is enough. We can close it manually.
  };

  return (
    <aside 
      className={cn(
        "absolute z-40 w-64 border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out rounded-2xl overflow-hidden max-h-[calc(100%-2rem)]",
        isOpen ? "left-4 top-4 opacity-100 scale-100" : "-left-10 top-4 opacity-0 scale-95 pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Node Palette
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="flex flex-col gap-2">
            {NODE_TYPES.map((node) => (
              <div
                key={node.type}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                )}
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", node.bgColor)}>
                     <node.icon className={cn("h-4 w-4", node.color)} />
                  </div>
                  <span className="text-sm font-medium">{node.label}</span>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </div>
            ))}
          </div>


          
          <div className="mt-auto p-4 rounded-xl bg-muted/40 border border-dashed border-border text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag & drop nodes onto the canvas to build your workflow.
            </p>
          </div>
      </div>
    </aside>
  );
};

export default NodePalette;
