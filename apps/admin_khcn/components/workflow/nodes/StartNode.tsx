import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { Play } from "lucide-react";

const StartNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="start"
      label="Start"
      icon={<Play className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />}
      selected={selected}
      className="border-emerald-500/30"
    >
      <div className="text-sm font-medium">Trigger workflow</div>
    </BaseNode>
  );
};

export default memo(StartNode);
