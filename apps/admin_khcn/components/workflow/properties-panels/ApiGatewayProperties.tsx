/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { PropertiesPanelComponentProps } from "./types";

export const ApiGatewayProperties = ({ data, handleChange, availableServices = [] }: PropertiesPanelComponentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Đường dẫn Endpoint (Path)
        </label>
        <Input name="endpoint" value={data.endpoint || ""} onChange={handleChange} />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          HTTP Method
        </label>
        <NativeSelect
          name="method"
          value={data.method || "ALL"}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="ALL">ALL</NativeSelectOption>
          <NativeSelectOption value="GET">GET</NativeSelectOption>
          <NativeSelectOption value="POST">POST</NativeSelectOption>
          <NativeSelectOption value="PUT">PUT</NativeSelectOption>
          <NativeSelectOption value="DELETE">DELETE</NativeSelectOption>
        </NativeSelect>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Map To Microservice
        </label>
        <NativeSelect
          name="targetService"
          value={data.targetService || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">Chọn microservice đích...</NativeSelectOption>
          {availableServices.map((svc: any) => (
            <NativeSelectOption key={svc.code || svc.id} value={svc.code || svc.id}>
              {svc.name || svc.title}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase">
          Yêu cầu Xác thực (JWT Auth)
        </label>
        <Switch
          name="requiresAuth"
          checked={data.requiresAuth || false}
          onCheckedChange={(checked) => handleChange({ target: { name: 'requiresAuth', value: checked } } as any)}
        />
      </div>
    </div>
  );
};
