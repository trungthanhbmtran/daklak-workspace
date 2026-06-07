import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { Network } from "lucide-react";

const ExternalSystemNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="external_system"
      label="Hệ thống đối tác (Integration)"
      icon={<Network className="h-3.5 w-3.5 text-amber-500" />}
      selected={selected}
      className="border-amber-500/30"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.systemName || "Đối tác LGSP"}</div>
        <div className="text-[10px] text-muted-foreground italic truncate">
          Code: {data.integrationCode || "LGSP_123"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(ExternalSystemNode);
