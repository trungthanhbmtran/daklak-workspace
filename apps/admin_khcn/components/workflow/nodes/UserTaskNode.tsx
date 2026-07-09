import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { UserCheck } from "lucide-react";
import { WorkflowStatusBadge } from "../shared/WorkflowStatusBadge";

const UserTaskNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="user_task"
      label="User Task"
      icon={<UserCheck className="h-3.5 w-3.5 text-blue-500" />}
      selected={selected}
      className="border-blue-500/30 min-w-[150px]"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium whitespace-pre-wrap wrap-break-words">{data.label || data.role || "Unassigned"}</div>
        <div className="text-[10px] text-muted-foreground italic whitespace-normal wrap-break-words">
          {data.description || "Assign to user role"}
        </div>
        {data.targetStatus && (
          <div className="mt-2">
            <WorkflowStatusBadge status={data.targetStatus} />
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default memo(UserTaskNode);
