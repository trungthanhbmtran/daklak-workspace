import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "../types";

export const AdvancedExpressionConfig = ({ handleChange, selectedEdge }: PropertiesPanelComponentProps) => {
  if (!selectedEdge) return null;
  const edgeData = selectedEdge.data || {};

  return (
    <AccordionItem value="advanced" className="border-none">
      <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border hover:bg-muted/80 py-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mã điều kiện (Dành cho IT)</span>
      </AccordionTrigger>
      <AccordionContent className="p-4 rounded-b-xl bg-muted/30 border border-t-0 space-y-4">
        <div className="relative group">
          <div className="absolute left-3 top-3.5 text-muted-foreground">
            <span className="font-mono text-xs font-bold bg-muted px-1 py-0.5 rounded">fx</span>
          </div>
          <Textarea
            name="expression"
            value={(edgeData.expression as string) || ""}
            onChange={handleChange}
            className="w-full bg-background border border-border rounded-xl p-3 pl-12 text-sm font-mono min-h-[80px]"
            placeholder="actionName === 'APPROVE'"
            spellCheck={false}
          />
          <p className="text-[10px] text-muted-foreground mt-2">
            Chuỗi mã này được tự động sinh ra từ Bộ tạo điều kiện. Nếu bạn nhập tay, nó sẽ ghi đè logic rẽ nhánh.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
