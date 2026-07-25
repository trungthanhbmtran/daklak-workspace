import React from 'react';
import { Input } from "@/components/ui/input";
import { PropertiesPanelComponentProps } from "../types";

export const BasicEdgeConfig = ({ handleChange, selectedEdge }: PropertiesPanelComponentProps) => {
  if (!selectedEdge) return null;
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
        Tên thao tác (Label)
      </label>
      <Input type="text"
        name="label"
        value={(selectedEdge.label as string) || ""}
        onChange={handleChange}
        className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
        placeholder="VD: APPROVE, REJECT, KÝ DUYỆT"
      />
      <p className="text-[10px] text-muted-foreground mt-1.5">
        Tên hiển thị trên sơ đồ quy trình.
      </p>
    </div>
  );
};
