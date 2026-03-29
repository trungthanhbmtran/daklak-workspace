import React from "react";
import { 
  Play, 
  UserCheck, 
  Split, 
  Zap, 
  CircleStop,
  GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_TYPES = [
  { type: "start", label: "Start", icon: Play, color: "text-emerald-500", bgColor: "bg-emerald-50" },
  { type: "user_task", label: "User Task", icon: UserCheck, color: "text-blue-500", bgColor: "bg-blue-50" },
  { type: "condition", label: "Condition", icon: Split, color: "text-amber-500", bgColor: "bg-amber-50" },
  { type: "service_task", label: "Action", icon: Zap, color: "text-violet-500", bgColor: "bg-violet-50" },
  { type: "end", label: "End", icon: CircleStop, color: "text-rose-500", bgColor: "bg-rose-50" },
];

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-64 border-r border-border bg-card p-4 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Node Palette
        </h3>
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
      </div>
      
      <div className="mt-auto p-4 rounded-xl bg-muted/40 border border-dashed border-border text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Drag & drop nodes onto the canvas to build your workflow.
        </p>
      </div>
    </aside>
  );
};

export default NodePalette;
