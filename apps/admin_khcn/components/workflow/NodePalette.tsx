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
  { type: "start", label: "Bắt đầu", icon: Play, color: "text-emerald-500", bgColor: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { type: "user_task", label: "Bước xử lý", icon: UserCheck, color: "text-blue-500", bgColor: "bg-blue-500/10", border: "border-blue-500/20" },
  { type: "exclusive_gateway", label: "Điều kiện rẽ nhánh", icon: Split, color: "text-amber-500", bgColor: "bg-amber-500/10", border: "border-amber-500/20" },
  { type: "end", label: "Kết thúc", icon: CircleStop, color: "text-rose-500", bgColor: "bg-rose-500/10", border: "border-rose-500/20" },
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
  };

  return (
    <aside 
      className={cn(
        "absolute z-40 w-64 border-r border-border/60 bg-card flex flex-col transition-all duration-300 ease-in-out h-full shadow-lg",
        isOpen ? "left-0 opacity-100 translate-x-0" : "-left-64 opacity-0 -translate-x-full pointer-events-none"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
        <h3 className="text-sm font-bold text-foreground">
          Khay Tác nhân
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex flex-col gap-2">
            {NODE_TYPES.map((node) => (
              <div
                key={node.type}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-muted/30 transition-all cursor-grab active:cursor-grabbing",
                  node.border
                )}
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-1.5 rounded-md", node.bgColor)}>
                     <node.icon className={cn("h-4 w-4", node.color)} />
                  </div>
                  <span className="text-sm font-medium">{node.label}</span>
                </div>
                <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
              </div>
            ))}
          </div>

          <div className="p-3 mt-4 rounded-lg bg-blue-50 border border-blue-100 text-center">
            <p className="text-[12px] text-blue-700">
              Kéo (Drag) một tác nhân và thả (Drop) vào không gian làm việc bên phải.
            </p>
          </div>
      </div>
    </aside>
  );
};

export default NodePalette;
