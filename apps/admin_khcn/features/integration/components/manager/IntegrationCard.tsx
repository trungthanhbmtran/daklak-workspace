/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback } from "react";
import { Edit, Trash2, ShieldCheck, Activity, Plug, Download } from "lucide-react";
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

  const handleExport = useCallback(() => {
    try {
      // Create a clean export object (removing internal IDs or timestamps if desired, but we can just export the whole item)
      const exportData = {
        name: item.name,
        code: item.code,
        protocol: item.protocol,
        baseUrl: item.baseUrl,
        authType: item.authType,
        authConfig: item.authConfig,
        metadata: item.metadata,
        isActive: item.isActive,
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `integration-${item.code || "export"}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file cấu hình");
    } catch (error) {
      toast.error("Lỗi khi xuất file");
    }
  }, [item]);

  return (
    <Card className="group relative flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader className="relative flex flex-row items-center gap-4 pb-4 space-y-0">
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <CardTitle className="text-lg font-bold truncate">
            {item.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md truncate">
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
            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${item.isActive ? "bg-primary/10" : "bg-muted"}`}>
              <ShieldCheck className={`w-3.5 h-3.5 ${item.isActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className={`text-sm font-semibold ${item.isActive ? "text-primary" : "text-muted-foreground"}`}>
              {item.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100/50 dark:border-slate-800/50">
          <span>Cập nhật</span>
          <span>{formatDate(item.updatedAt, "dd/MM/yyyy HH:mm")}</span>
        </div>
      </CardContent>

      <CardFooter className="relative border-t p-4 bg-muted/30 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Switch
            checked={item.isActive}
            onCheckedChange={() => handleToggleActive(item.isActive)}
          />
        </div>
        <div className="flex gap-1">
          {onExplore && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onExplore(item)} title="Quản lý Endpoints">
              <Plug className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleExport} title="Xuất cấu hình (JSON)">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(item)} title="Sửa thông tin">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});
