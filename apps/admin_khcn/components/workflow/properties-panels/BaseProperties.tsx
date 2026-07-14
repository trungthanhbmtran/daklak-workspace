import React from 'react';
import { Activity, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface BasePropertiesProps {
  workflowCode: string;
  setWorkflowCode: (code: string) => void;
  workflowDesc: string;
  setWorkflowDesc: (desc: string) => void;
}

export const BaseProperties = ({ workflowCode, setWorkflowCode, workflowDesc, setWorkflowDesc }: BasePropertiesProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-2.5 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" /> Mã quy trình (Code)
        </label>
        <Input
          value={workflowCode || ""}
          onChange={(e) => setWorkflowCode(e.target.value)}
          className="w-full bg-background border border-border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          placeholder="Nhập mã quy trình (VD: TASK_PROCESSING)..."
        />
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          Mã định danh duy nhất của quy trình.
        </p>
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase mb-2.5  flex items-center gap-2">
          <FileText className="h-3.5 w-3.5" /> Mô tả quy trình
        </label>
        <Textarea
          value={workflowDesc}
          onChange={(e) => setWorkflowDesc(e.target.value)}
          placeholder="Nhập mô tả cho quy trình này..."
          className="min-h-[150px] rounded-xl bg-muted/30 border-border/40 focus-visible:ring-primary/20 resize-none text-sm"
        />
      </div>
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
        <h4 className="text-xs font-bold text-primary uppercase mb-2">Hướng dẫn nhanh</h4>
        <ul className="text-[11px] text-muted-foreground space-y-2 list-disc pl-4">
          <li>Kéo thả các node từ thanh công cụ bên trái.</li>
          <li>Kết nối các node để tạo luồng xử lý.</li>
          <li>Nhấp vào một node hoặc đường nối (edge) để cấu hình chi tiết.</li>
          <li>Đừng quên lưu bản nháp thường xuyên.</li>
        </ul>
      </div>
    </div>
  );
};
