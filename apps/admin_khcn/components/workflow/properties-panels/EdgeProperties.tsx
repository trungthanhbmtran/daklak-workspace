import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { PropertiesPanelComponentProps } from "./types";
import { Plus, Trash2 } from "lucide-react";

export const EdgeProperties = ({ data, handleChange, selectedEdge, onUpdateEdge }: PropertiesPanelComponentProps) => {
  if (!selectedEdge) return null;
  const edgeData = data;
  
  // State for visual rule builder
  const [field, setField] = useState("");
  const [operator, setOperator] = useState("===");
  const [value, setValue] = useState("");
  
  // Parse expression to populate visual builder on load
  useEffect(() => {
    if (edgeData.expression) {
      const match = (edgeData.expression as string).match(/^([a-zA-Z0-9_]+)\s*(===|!==|>|<|>=|<=)\s*(['"]?)(.*?)\3$/);
      if (match) {
        setField(match[1]);
        setOperator(match[2]);
        setValue(match[4]);
      }
    }
  }, [edgeData.expression]);

  const updateExpression = (f: string, o: string, v: string) => {
    if (!f) return;
    const isNumber = !isNaN(Number(v)) && v !== "";
    const quote = isNumber ? "" : "'";
    const newExpression = `${f} ${o} ${quote}${v}${quote}`;
    
    if (onUpdateEdge) {
      onUpdateEdge(selectedEdge.id, {
        ...selectedEdge,
        data: {
          ...(selectedEdge.data || {}),
          expression: newExpression
        }
      });
    }
  };

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
          Bộ tạo điều kiện (Visual Rule Builder)
        </label>
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-3">
          <div className="flex gap-2">
            <NativeSelect
              value={field}
              onChange={(e) => { setField(e.target.value); updateExpression(e.target.value, operator, value); }}
              className="w-1/3 bg-white"
            >
              <NativeSelectOption value="">-- Chọn biến --</NativeSelectOption>
              <NativeSelectOption value="actionName">Hành động (actionName)</NativeSelectOption>
              <NativeSelectOption value="assigneeCode">Người thực hiện (assigneeCode)</NativeSelectOption>
              <NativeSelectOption value="status">Trạng thái (status)</NativeSelectOption>
            </NativeSelect>

            <NativeSelect
              value={operator}
              onChange={(e) => { setOperator(e.target.value); updateExpression(field, e.target.value, value); }}
              className="w-1/4 bg-white"
            >
              <NativeSelectOption value="===">Bằng</NativeSelectOption>
              <NativeSelectOption value="!==">Khác</NativeSelectOption>
              <NativeSelectOption value=">">Lớn hơn</NativeSelectOption>
              <NativeSelectOption value="<">Nhỏ hơn</NativeSelectOption>
            </NativeSelect>

            <Input
              value={value}
              onChange={(e) => { setValue(e.target.value); updateExpression(field, operator, e.target.value); }}
              placeholder="VD: UNASSIGNED"
              className="w-5/12 bg-white"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Thiết lập điều kiện rẽ nhánh trực quan. Dành cho các cổng Gateway.
          </p>
        </div>
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
