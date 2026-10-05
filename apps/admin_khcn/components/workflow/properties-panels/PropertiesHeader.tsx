import React from "react";
import { Settings2, Activity, Code2 } from "lucide-react";
import { Node, Edge } from "@xyflow/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  data: any;
  isExpertMode?: boolean;
  setIsExpertMode?: (value: boolean) => void;
}

export const PropertiesHeader = ({ selectedNode, selectedEdge, data, isExpertMode = false, setIsExpertMode }: Props) => {
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
      
      {setIsExpertMode && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  id="expert-mode"
                  checked={isExpertMode}
                  onCheckedChange={setIsExpertMode}
                  className="data-[state=checked]:bg-indigo-600"
                />
                <Label htmlFor="expert-mode" className="text-xs font-medium text-muted-foreground flex items-center cursor-pointer">
                  <Code2 className="w-3 h-3 mr-1" />
                  Dev
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent align="end">
              <p className="text-xs max-w-[200px]">Bật chế độ chuyên gia (Expert Mode) để cấu hình JSON, API, và các thuộc tính kỹ thuật.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
