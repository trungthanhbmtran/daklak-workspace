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
        "absolute z-40 w-64 top-[90px] bottom-6 flex flex-col transition-all duration-500 ease-out",
        isOpen ? "left-6 opacity-100 translate-x-0" : "-left-10 opacity-0 -translate-x-full pointer-events-none"
      )}
    >
      <div className="flex-1 border border-white/20 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex flex-col rounded-3xl overflow-hidden relative">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h3 className="text-xs font-bold text-foreground/80 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Tác nhân
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {NODE_TYPES.map((node) => (
              <div
                key={node.type}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-2xl border bg-background/50 backdrop-blur hover:bg-background hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing",
                  node.border
                )}
                onDragStart={(event) => onDragStart(event, node.type)}
                draggable
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl shadow-sm", node.bgColor)}>
                     <node.icon className={cn("h-4 w-4", node.color)} />
                  </div>
                  <span className="text-sm font-semibold text-foreground/90">{node.label}</span>
                </div>
                <div className="w-6 h-6 flex items-center justify-center rounded-md group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-colors">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground/70 transition-colors" />
                </div>
              </div>
            ))}
        </div>

        <div className="p-4 m-3 mt-auto rounded-2xl bg-primary/5 border border-primary/10 text-center">
          <p className="text-[11px] font-medium text-primary/80 leading-relaxed">
            Kéo thả các node vào vùng làm việc để xây dựng quy trình
          </p>
        </div>
      </div>
    </aside>
  );
};

export default NodePalette;
