import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PropertiesPanelComponentProps } from "./types";

export const NginxProxyProperties = ({ data, handleChange }: PropertiesPanelComponentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Server Name (Domain)
        </label>
        <Input name="domain" value={data.domain || ""} onChange={handleChange} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Listen Port
        </label>
        <Input name="port" value={data.port || ""} onChange={handleChange} />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase">
          Bật WAF (Web Application Firewall)
        </label>
        <Switch
          name="wafEnabled"
          checked={data.wafEnabled || false}
          onCheckedChange={(checked) => handleChange({ target: { name: 'wafEnabled', value: checked } } as any)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Cấu hình NGINX Tuỳ chỉnh (Advanced)
        </label>
        <Textarea
          name="customConfig"
          value={data.customConfig || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          placeholder="location / { ... }"
        />
      </div>
    </div>
  );
};
