"use client";

import React, { useCallback } from "react";
import { Edit, Trash2, ShieldCheck, Activity, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteIntegration, useToggleActiveIntegration, IntegrationConfig } from "../../api";
import { toast } from "sonner";
import { format } from "date-fns";

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
    <Card className="group relative flex flex-col hover:shadow-lg transition-all duration-300 hover:border-violet-300 dark:hover:border-violet-700/50">
      <CardHeader className="flex flex-row items-center gap-4 pb-4 space-y-0">
        <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/50 flex shrink-0 items-center justify-center">
          <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex flex-col gap-1.5 overflow-hidden">
          <CardTitle className="text-lg truncate">{item.systemName}</CardTitle>
          <CardDescription className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md w-fit truncate">
            {item.integrationCode}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Trạng thái kết nối:</span>
          <Badge variant={item.isActive ? "default" : "secondary"} className={item.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : ""}>
            {item.isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
          </Badge>
        </div>

        <div className="text-xs text-slate-500 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span>Cập nhật lần cuối:</span>
          <span className="font-medium">{item.updatedAt ? format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm") : "-"}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={item.isActive}
            onCheckedChange={() => handleToggleActive(item.isActive)}
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hoạt động</span>
        </div>
        <div className="flex gap-1 -mr-2">
          {onExplore && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 rounded-lg transition-colors" onClick={() => onExplore(item)} title="Quản lý Endpoints">
              <Plug className="w-4 h-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" onClick={() => onEdit(item)} title="Sửa thông tin">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" onClick={handleDelete} title="Xóa">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
});
