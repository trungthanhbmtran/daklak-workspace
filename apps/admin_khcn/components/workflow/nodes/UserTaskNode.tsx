import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { UserCheck } from "lucide-react";

const UserTaskNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="user_task"
      label="User Task"
      icon={<UserCheck className="h-3.5 w-3.5 text-blue-500" />}
      selected={selected}
      className="border-blue-500/30"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.role || "Unassigned"}</div>
        <div className="text-[10px] text-muted-foreground italic truncate">
          {data.description || "Assign to user role"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(UserTaskNode);
