/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback } from "react";
import { Edit, Trash2, ShieldCheck, Activity, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteIntegration, useToggleActiveIntegration, IntegrationConfig } from "../../api";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface IntegrationCardProps {
  item: IntegrationConfig;
  onEdit: (item: IntegrationConfig) => void;
  onExplore?: (item: IntegrationConfig) => void;
}

export const IntegrationCard = React.memo(function IntegrationCard({ item, onEdit, onExplore }: IntegrationCardProps) {
  const deleteMutation = useDeleteIntegration();
  const toggleActiveMutation = useToggleActiveIntegration();

  const handleDelete = useCallback(() => {
    if (confirm("Bạn có chắc chắn muốn xóa cấu hình tích hợp này?")) {
      deleteMutation.mutate(item.id, {
        onSuccess: () => toast.success("Đã xóa cấu hình tích hợp"),
        onError: (err: any) => toast.error(err.message || "Xóa thất bại")
      });
    }
  }, [item.id, deleteMutation]);

  const handleToggleActive = useCallback((currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id: item.id, isActive: !currentStatus }, {
      onSuccess: () => toast.success("Đã cập nhật trạng thái hoạt động"),
      onError: (err: any) => toast.error(err.message || "Cập nhật thất bại")
    });
  }, [item.id, toggleActiveMutation]);

  return (
    <Card className="group relative flex flex-col hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-500 border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden transform hover:-translate-y-1">
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="relative flex flex-row items-center gap-4 pb-4 space-y-0 z-10">
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/30 dark:to-fuchsia-900/30 border border-violet-100/50 dark:border-violet-800/30 flex shrink-0 items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
          <Activity className="w-7 h-7 text-violet-600 dark:text-violet-400 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors" />
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 truncate">
            {item.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium font-mono text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-1 rounded-md truncate">
              {item.code}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 space-y-5 z-10">
        <div className="space-y-3 text-sm">
          {item.baseUrl && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <Plug className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="break-all text-slate-600 dark:text-slate-300 font-mono text-xs">
                {item.baseUrl}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Protocol</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{item.protocol || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Auth</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{item.authType || "N/A"}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-1">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${item.isActive ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-slate-100 dark:bg-slate-800"}`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${item.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
            </div>
            <span className={`text-sm font-semibold ${item.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
              {item.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
          <span>Cập nhật</span>
          <span>{formatDate(item.updatedAt, "dd/MM/yyyy HH:mm")}</span>
        </div>
      </CardContent>

      <CardFooter className="relative border-t border-slate-100/80 dark:border-slate-800/80 p-4 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Switch
            checked={item.isActive}
            onCheckedChange={() => handleToggleActive(item.isActive)}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
        <div className="flex gap-1">
          {onExplore && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 hover:text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all" onClick={() => onExplore(item)} title="Quản lý Endpoints">
              <Plug className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all" onClick={() => onEdit(item)} title="Sửa thông tin">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all" onClick={handleDelete} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});
