import React from 'react';
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { PropertiesPanelComponentProps } from "./types";

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOp: '&&' | '||';
}

export const EdgeProperties = ({ data, handleChange, selectedEdge, onUpdateEdge }: PropertiesPanelComponentProps) => {
  if (!selectedEdge) return null;
  const edgeData = selectedEdge.data || {};
  const conditions = (edgeData.conditions as Condition[]) || [];

  const generateExpression = (conds: Condition[]) => {
    if (conds.length === 0) return "";
    return conds.map((c, i) => {
      if (!c.field) return "";
      const isNumber = !isNaN(Number(c.value)) && c.value !== "";
      const quote = isNumber ? "" : "'";
      const expr = `${c.field} ${c.operator} ${quote}${c.value}${quote}`;
      const nextOp = i < conds.length - 1 ? ` ${c.logicalOp} ` : "";
      return expr + nextOp;
    }).join("");
  };

  const updateConditions = (newConds: Condition[]) => {
    if (onUpdateEdge) {
      onUpdateEdge(selectedEdge.id, {
        ...selectedEdge,
        data: {
          ...(selectedEdge.data || {}),
          conditions: newConds,
          expression: generateExpression(newConds)
        }
      });
    }
  };

  const addCondition = () => {
    const newConds = [...conditions, { id: Math.random().toString(36).substring(7), field: "", operator: "===", value: "", logicalOp: "&&" as const }];
    updateConditions(newConds);
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    const newConds = conditions.map(c => c.id === id ? { ...c, [field]: value } : c);
    updateConditions(newConds);
  };

  const removeCondition = (id: string) => {
    const newConds = conditions.filter(c => c.id !== id);
    updateConditions(newConds);
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase block">
            Bộ tạo điều kiện (Visual Rule Builder)
          </label>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10" onClick={addCondition} iconStart={<Plus className="h-3 w-3" />}>Thêm</Button>
        </div>
        
        <div className="bg-muted border border-border rounded-lg p-3 space-y-3">
          {conditions.length === 0 && (
            <p className="text-[10px] text-muted-foreground text-center py-2">
              Không có điều kiện nào. Luồng này sẽ luôn chạy.
            </p>
          )}
          {conditions.map((c, idx) => (
            <div key={c.id} className="space-y-2 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              {idx > 0 && (
                <div className="flex items-center justify-center -mt-1 mb-2">
                  <NativeSelect
                    value={conditions[idx - 1].logicalOp}
                    onChange={(e) => updateCondition(conditions[idx - 1].id, 'logicalOp', e.target.value)}
                    className="w-20 h-6 text-[10px] bg-background text-center rounded-full border-border/80"
                  >
                    <NativeSelectOption value="&&">AND</NativeSelectOption>
                    <NativeSelectOption value="||">OR</NativeSelectOption>
                  </NativeSelect>
                </div>
              )}
              <div className="flex gap-2">
                <NativeSelect
                  value={c.field}
                  onChange={(e) => updateCondition(c.id, 'field', e.target.value)}
                  className="w-1/3 bg-background"
                >
                  <NativeSelectOption value="">-- Chọn biến --</NativeSelectOption>
                  <NativeSelectOption value="actionName">Hành động (actionName)</NativeSelectOption>
                  <NativeSelectOption value="assigneeCode">Người thực hiện (assigneeCode)</NativeSelectOption>
                  <NativeSelectOption value="status">Trạng thái (status)</NativeSelectOption>
                  <NativeSelectOption value="variables.isApproved">Được duyệt (isApproved)</NativeSelectOption>
                  <NativeSelectOption value="variables.amount">Số tiền (amount)</NativeSelectOption>
                </NativeSelect>

                <NativeSelect
                  value={c.operator}
                  onChange={(e) => updateCondition(c.id, 'operator', e.target.value)}
                  className="w-1/4 bg-background"
                >
                  <NativeSelectOption value="===">Bằng</NativeSelectOption>
                  <NativeSelectOption value="!==">Khác</NativeSelectOption>
                  <NativeSelectOption value=">">Lớn hơn</NativeSelectOption>
                  <NativeSelectOption value="<">Nhỏ hơn</NativeSelectOption>
                </NativeSelect>

                <Input
                  value={c.value}
                  onChange={(e) => updateCondition(c.id, 'value', e.target.value)}
                  placeholder="Giá trị..."
                  className="flex-1 bg-background"
                />
                <Button variant="ghost" size="icon" onClick={() => removeCondition(c.id)} className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full mt-4">
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
      </Accordion>
    </div>
  );
};
