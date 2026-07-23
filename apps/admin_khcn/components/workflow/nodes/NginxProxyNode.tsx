/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { memo } from "react";
import BaseNode from "./BaseNode";
import { GlobeLock } from "lucide-react";

const NginxProxyNode = ({ data, selected }: { data: any; selected: boolean }) => {
  return (
    <BaseNode
      type="nginx_proxy"
      label="NGINX Proxy (WAF)"
      icon={<GlobeLock className="h-3.5 w-3.5 text-emerald-500" />}
      selected={selected}
      className="border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
    >
      <div className="flex flex-col gap-1">
        <div className="text-sm font-medium">{data.domain || "example.com"}</div>
        <div className="text-[10px] text-muted-foreground italic truncate">
          Port: {data.port || "443"} | WAF: {data.wafEnabled ? "On" : "Off"}
        </div>
      </div>
    </BaseNode>
  );
};

export default memo(NginxProxyNode);
