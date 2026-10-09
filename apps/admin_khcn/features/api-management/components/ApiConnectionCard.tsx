import React from "react";
import { ApiConnection } from "../api";
import { Plug, Edit, Trash, Activity, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDisableConnection, useDeleteConnection } from "../hooks/useApiManagement";

interface Props {
  connection: ApiConnection;
  onEdit: (connection: ApiConnection) => void;
}

export function ApiConnectionCard({ connection, onEdit }: Props) {
  const disableMut = useDisableConnection();
  const deleteMut = useDeleteConnection();

  const handleDisable = () => {
    if (confirm('Bạn có chắc chắn muốn ngắt kết nối khẩn cấp hệ thống này không? Gateway sẽ lập tức đá văng người dùng hiện tại.')) {
      disableMut.mutate({ id: connection.id, expectedVersion: connection.version });
    }
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc chắn muốn xóa kết nối ${connection.displayName}? Hành động này không thể hoàn tác.`)) {
      deleteMut.mutate(connection.id);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-card-foreground shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full overflow-hidden">
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Plug className="w-6 h-6" />
            </div>
            <div className="pt-0.5">
              <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-primary transition-colors">
                {connection.displayName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                {connection.code}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                connection.enabled 
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" 
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
              }`}
            >
              <div className={`h-1.5 w-1.5 rounded-full ${connection.enabled ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" : "bg-amber-500"}`} />
              {connection.enabled ? "Active" : "Disabled"}
            </div>
          </div>
        </div>
        
        <div className="mt-2 mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 font-mono text-xs break-all">
            {connection.baseUrl}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>v{connection.version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {connection.enabled && (
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-900/50 dark:hover:bg-amber-900/30" 
              onClick={(e) => { e.stopPropagation(); handleDisable(); }} 
              disabled={disableMut.isPending} 
              title="Ngắt khẩn cấp"
            >
              {disableMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-slate-500 hover:text-primary hover:border-primary/50" 
            onClick={(e) => { e.stopPropagation(); onEdit(connection); }}
            title="Chỉnh sửa"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 text-slate-500 hover:text-destructive hover:border-destructive/50 hover:bg-destructive/10" 
            onClick={(e) => { e.stopPropagation(); handleDelete(); }} 
            disabled={deleteMut.isPending}
            title="Xóa kết nối"
          >
            {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
