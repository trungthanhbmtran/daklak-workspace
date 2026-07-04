"use client";

import React from "react";
import { Edit, Trash2, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useDeleteIntegration, useToggleActiveIntegration, IntegrationConfig } from "../../api";
import { toast } from "sonner";
import { format } from "date-fns";

interface IntegrationCardProps {
  item: IntegrationConfig;
  onEdit: (item: IntegrationConfig) => void;
}

export function IntegrationCard({ item, onEdit }: IntegrationCardProps) {
  const deleteMutation = useDeleteIntegration();
  const toggleActiveMutation = useToggleActiveIntegration();

  const handleDelete = () => {
    if (confirm("Bạn có chắc chắn muốn xóa cấu hình tích hợp này?")) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => toast.success("Đã xóa cấu hình tích hợp"),
        onError: (err: any) => toast.error(err.message || "Xóa thất bại")
      });
    }
  };

  const handleToggleActive = (currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id: item.id, isActive: !currentStatus }, {
      onSuccess: () => toast.success("Đã cập nhật trạng thái hoạt động"),
      onError: (err: any) => toast.error(err.message || "Cập nhật thất bại")
    });
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-700/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 flex items-center justify-center">
            <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.systemName}</h3>
            <p className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block mt-1">
              {item.integrationCode}
            </p>
          </div>
        </div>
        
        {/* Actions context */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 rounded-lg" onClick={() => onEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 rounded-lg" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Trạng thái kết nối:</span>
          <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : ""}>
            {item.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
          </Badge>
        </div>
        
        <div className="text-xs text-slate-500 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
          <span>Cập nhật lần cuối:</span>
          <span className="font-medium">{item.updatedAt ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm") : "-"}</span>
        </div>
      </div>

      {/* Quick Toggle */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hoạt động</span>
        <Switch 
          checked={item.isActive} 
          onCheckedChange={() => handleToggleActive(item.isActive)} 
        />
      </div>
    </div>
  );
}
