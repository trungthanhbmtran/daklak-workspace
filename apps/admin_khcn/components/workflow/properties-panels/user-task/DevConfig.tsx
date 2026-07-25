/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PropertiesPanelComponentProps } from "../types";

export const DevConfig = ({ data, handleChange, onUpdate, selectedNode }: PropertiesPanelComponentProps) => {
  const [sideEffects, setSideEffects] = useState<any[]>([]);

  useEffect(() => {
    if (data.sideEffects) {
      try {
        const parsed = typeof data.sideEffects === 'string' ? JSON.parse(data.sideEffects) : data.sideEffects;
        setSideEffects(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setSideEffects([]);
      }
    }
  }, [data.sideEffects]);

  const updateSideEffects = (newEffects: any[]) => {
    setSideEffects(newEffects);
    if (selectedNode && onUpdate) {
      onUpdate(selectedNode.id, {
        ...data,
        sideEffects: JSON.stringify(newEffects, null, 2)
      });
    }
  };

  if (!selectedNode || !onUpdate) return null;

  return (
    <AccordionItem value="dev-advanced" className="border-none">
      <AccordionTrigger className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border hover:bg-accent hover:text-accent-foreground py-2">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lập trình & API</span>
      </AccordionTrigger>
      <AccordionContent className="p-4 rounded-b-xl bg-muted/30 border border-t-0 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase">Bật Notification</label>
          <Switch checked={data.sendNotification || false} onCheckedChange={(c) => handleChange({ target: { name: 'sendNotification', value: c } } as any)} />
        </div>
        
        <div className="border-t border-border pt-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Hành động phụ (Side Effects)</label>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10" onClick={() => updateSideEffects([...sideEffects, { id: Math.random().toString(36).substring(7), type: "WEBHOOK", url: "" }])}>
              <Plus className="h-3 w-3 mr-1" /> Thêm API
            </Button>
          </div>
          <div className="space-y-3">
            {sideEffects.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground py-2 border border-dashed border-border rounded-lg">Chưa có hành động phụ nào.</p>
            )}
            {sideEffects.map((effect, idx) => (
              <div key={effect.id || idx} className="bg-background border border-border rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <NativeSelect 
                    value={effect.type} 
                    onChange={(e) => updateSideEffects(sideEffects.map((f, i) => i === idx ? { ...f, type: e.target.value } : f))}
                    className="h-7 text-xs w-[120px]"
                  >
                    <NativeSelectOption value="WEBHOOK">Webhook (POST)</NativeSelectOption>
                    <NativeSelectOption value="EVENT">Bắn Event (RabbitMQ)</NativeSelectOption>
                  </NativeSelect>
                  <Button variant="ghost" size="icon" onClick={() => updateSideEffects(sideEffects.filter((_, i) => i !== idx))} className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 ml-auto">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input 
                  placeholder={effect.type === 'WEBHOOK' ? "URL Webhook..." : "Tên Event..."} 
                  value={effect.url || effect.eventName || ""} 
                  onChange={(e) => {
                    const key = effect.type === 'WEBHOOK' ? 'url' : 'eventName';
                    updateSideEffects(sideEffects.map((f, i) => i === idx ? { ...f, [key]: e.target.value } : f))
                  }}
                  className="h-7 text-xs font-mono"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-border pt-4 mt-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Mã JSON Form (Readonly)</label>
          <Textarea value={data.formSchema || ""} readOnly className="w-full bg-background border border-border rounded-xl p-3 text-[10px] font-mono min-h-[60px] text-muted-foreground opacity-70" spellCheck={false} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
