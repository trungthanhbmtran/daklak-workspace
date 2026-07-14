import React from 'react';
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { PropertiesPanelComponentProps } from "./types";

export const EdgeProperties = ({ data, handleChange, selectedEdge, onUpdateEdge }: PropertiesPanelComponentProps) => {
  if (!selectedEdge) return null;
  const edgeData = data;
  
  return (
    <div className="space-y-4">
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
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">
          Điều kiện rẽ nhánh (Dành cho Gateway)
        </label>
        <NativeSelect
          name="actionName"
          value={(edgeData.actionName as string) || ""}
          onChange={(e) => {
            const actionVal = e.target.value;
            let newExpression = "";
            let newLabel = (selectedEdge.label as string) || "";
            
            if (actionVal === "APPROVE") {
              newExpression = "actionName === 'APPROVE'";
              if (!newLabel || newLabel === "Từ chối") newLabel = "Đồng ý / Phê duyệt";
            } else if (actionVal === "REJECT") {
              newExpression = "actionName === 'REJECT'";
              if (!newLabel || newLabel === "Đồng ý / Phê duyệt") newLabel = "Từ chối";
            } else if (actionVal === "SUBMIT") {
              newExpression = "actionName === 'SUBMIT'";
            } else if (actionVal) {
              newExpression = `actionName === '${actionVal}'`;
            }

            if (onUpdateEdge) {
              onUpdateEdge(selectedEdge.id, {
                ...selectedEdge,
                label: newLabel,
                data: {
                  ...(selectedEdge.data || {}),
                  actionName: actionVal,
                  expression: newExpression
                }
              });
            }
          }}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        >
          <NativeSelectOption value="">(Không có điều kiện - Đi thẳng)</NativeSelectOption>
          <NativeSelectOption value="APPROVE">Nếu bước trước: ĐỒNG Ý / PHÊ DUYỆT</NativeSelectOption>
          <NativeSelectOption value="REJECT">Nếu bước trước: TỪ CHỐI</NativeSelectOption>
          <NativeSelectOption value="SUBMIT">Nếu bước trước: HOÀN THÀNH / TRÌNH KÝ</NativeSelectOption>
        </NativeSelect>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Chỉ áp dụng khi đường nối này đi ra từ Nút Rẽ nhánh (Gateway).
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 py-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mã điều kiện (Dành cho IT)</span>
          </AccordionTrigger>
          <AccordionContent className="p-4 rounded-b-xl bg-slate-50/50 border border-t-0 space-y-4">
            <div className="relative group">
              <div className="absolute left-3 top-3.5 text-slate-400">
                <span className="font-mono text-xs font-bold bg-slate-100 px-1 py-0.5 rounded">fx</span>
              </div>
              <Textarea
                name="expression"
                value={(edgeData.expression as string) || ""}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 pl-12 text-sm font-mono min-h-[80px]"
                placeholder="actionName === 'APPROVE'"
                spellCheck={false}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
