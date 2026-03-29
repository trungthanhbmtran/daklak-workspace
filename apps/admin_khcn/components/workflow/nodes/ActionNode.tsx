import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { Zap } from "lucide-react";

const ActionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="service_task"
      label="Action"
      icon={<Zap className="h-3.5 w-3.5 fill-violet-500 text-violet-500" />}
      selected={selected}
      className="border-violet-500/30"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.action || "Select Action"}</div>
        <div className="text-[10px] text-muted-foreground italic truncate">
          {data.service || "External Service"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(ActionNode);
