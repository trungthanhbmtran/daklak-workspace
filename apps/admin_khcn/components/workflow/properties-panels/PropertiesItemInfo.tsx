import React from "react";
import { Node, Edge } from "@xyflow/react";

interface Props {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
}

export const PropertiesItemInfo = ({ selectedNode, selectedEdge }: Props) => {
  if (selectedNode) {
    return (
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
    );
  }

  if (selectedEdge) {
    return (
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
    );
  }

  return null;
};
