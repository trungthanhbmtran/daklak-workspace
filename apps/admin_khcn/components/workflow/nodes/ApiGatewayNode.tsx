/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { Route } from "lucide-react";

const ApiGatewayNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="api_gateway"
      label="API Gateway Route"
      icon={<Route className="h-3.5 w-3.5 text-violet-500" />}
      selected={selected}
      className="border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.endpoint || "/api/v1/*"}</div>
        <div className="text-[10px] text-muted-foreground italic truncate">
          Method: {data.method || "ALL"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(ApiGatewayNode);
