/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { CircleStop } from "lucide-react";
import { WorkflowStatusBadge } from "../shared/WorkflowStatusBadge";

const EndNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="end"
      label="End"
      icon={<CircleStop className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />}
      selected={selected}
      className="border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.label || "Terminate"}</div>
        {data.targetStatus && (
          <div className="mt-2">
            <WorkflowStatusBadge status={data.targetStatus} />
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(EndNode);
