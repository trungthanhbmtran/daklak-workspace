import React from "react";
import { Settings2, Activity } from "lucide-react";
import { Node, Edge } from "@xyflow/react";

interface Props {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  data: any;
}

export const PropertiesHeader = ({ selectedNode, selectedEdge, data }: Props) => {
  return (
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
  );
};
