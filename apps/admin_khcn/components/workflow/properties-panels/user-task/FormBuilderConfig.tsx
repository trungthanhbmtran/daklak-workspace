/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "../types";

export const FormBuilderConfig = ({ data, onUpdate, selectedNode }: PropertiesPanelComponentProps) => {
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    if (data.formSchema) {
      try {
        const parsed = typeof data.formSchema === 'string' ? JSON.parse(data.formSchema) : data.formSchema;
        setFormFields(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setFormFields([]);
      }
    }
  }, [data.formSchema]);

  const updateFormFields = (newFields: any[]) => {
    setFormFields(newFields);
    if (selectedNode && onUpdate) {
      onUpdate(selectedNode.id, {
        ...data,
        formSchema: JSON.stringify(newFields, null, 2)
      });
    }
  };

  if (!selectedNode || !onUpdate) return null;

  return (
    <AccordionItem value="form-builder" className="border-none">
      <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted py-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Form Builder (Tạo biểu mẫu)</span>
      </AccordionTrigger>
      <AccordionContent className="p-4 rounded-b-xl bg-muted/30 border border-t-0 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Thêm các trường dữ liệu cần nhập.</span>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10" onClick={() => updateFormFields([...formFields, { id: Math.random().toString(36).substring(7), name: "", label: "", type: "text" }])}>
            <Plus className="h-3 w-3 mr-1" /> Thêm Field
          </Button>
        </div>
        
        <div className="space-y-3">
          {formFields.length === 0 && (
            <p className="text-[10px] text-center text-muted-foreground py-2 border border-dashed border-border rounded-lg">Chưa có trường dữ liệu nào.</p>
          )}
          {formFields.map((field, idx) => (
            <div key={field.id || idx} className="bg-background border border-border rounded-lg p-3 flex flex-col gap-2 relative group">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                <Input 
                  placeholder="Mã biến (VD: reason)" 
                  value={field.name} 
                  onChange={(e) => updateFormFields(formFields.map((f, i) => i === idx ? { ...f, name: e.target.value } : f))}
                  className="h-7 text-xs font-mono"
                />
                <Button variant="ghost" size="icon" onClick={() => updateFormFields(formFields.filter((_, i) => i !== idx))} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <Input 
                  placeholder="Tên hiển thị (VD: Lý do)" 
                  value={field.label} 
                  onChange={(e) => updateFormFields(formFields.map((f, i) => i === idx ? { ...f, label: e.target.value } : f))}
                  className="h-7 text-xs flex-1"
                />
                <NativeSelect 
                  value={field.type} 
                  onChange={(e) => updateFormFields(formFields.map((f, i) => i === idx ? { ...f, type: e.target.value } : f))}
                  className="h-7 text-xs w-[100px]"
                >
                  <NativeSelectOption value="text">Text</NativeSelectOption>
                  <NativeSelectOption value="textarea">Textarea</NativeSelectOption>
                  <NativeSelectOption value="number">Number</NativeSelectOption>
                  <NativeSelectOption value="date">Date</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
