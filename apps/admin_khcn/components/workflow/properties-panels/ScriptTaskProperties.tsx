import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { PropertiesPanelComponentProps } from "./types";

export const ScriptTaskProperties = ({ data, handleChange }: PropertiesPanelComponentProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Mã kịch bản (Script / Expression)
        </label>
        <Textarea
          name="expression"
          value={data.expression || ""}
          onChange={handleChange}
          className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[150px] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
          placeholder="Math.random() > 0.5 ? 'approved' : 'rejected'"
        />
      </div>
    </div>
  );
};
