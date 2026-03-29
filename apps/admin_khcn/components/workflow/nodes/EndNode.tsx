import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { CircleStop } from "lucide-react";

const EndNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="end"
      label="End"
      icon={<CircleStop className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />}
      selected={selected}
      className="border-rose-500/30"
    >
      <div className="text-sm font-medium">Terminate</div>
    </BaseNode>
  );
};

export default memo(EndNode);
