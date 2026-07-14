import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertiesPanelComponentProps } from "./types";

export const ExternalSystemProperties = ({ data, handleChange }: PropertiesPanelComponentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Tên hệ thống đối tác
        </label>
        <Input name="systemName" value={data.systemName || ""} onChange={handleChange} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Mã liên thông (Code)
        </label>
        <Input name="integrationCode" value={data.integrationCode || ""} onChange={handleChange} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          API URL (Outbound)
        </label>
        <Input name="apiUrl" value={data.apiUrl || ""} onChange={handleChange} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          API Token / Secret
        </label>
        <Input type="password"
          name="apiToken"
          value={data.apiToken || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="****************"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Nhập JSON Postman (tuỳ chọn)
        </label>
        <Textarea
          name="postmanJson"
          value={data.postmanJson || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          placeholder="{ ... }"
        />
      </div>
    </div>
  );
};
