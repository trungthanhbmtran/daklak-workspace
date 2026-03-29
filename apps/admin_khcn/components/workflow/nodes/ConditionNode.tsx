import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { Split } from "lucide-react";

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="condition"
      label="Condition"
      icon={<Split className="h-3.5 w-3.5 text-amber-500" />}
      selected={selected}
      className="border-amber-500/30"
    >
      <div className="flex flex-col gap-1">
        <div className="text-xs font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 truncate">
          {data.expression || "if (variable == true)"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(ConditionNode);
