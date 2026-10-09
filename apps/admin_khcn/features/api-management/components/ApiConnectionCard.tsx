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
    <div className="group relative flex flex-col justify-between p-5 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Plug className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base line-clamp-1">{connection.displayName}</h3>
              <p className="text-xs text-muted-foreground font-mono">{connection.code}</p>
            </div>
          </div>
          <div className={"h-2 w-2 rounded-full " + (connection.enabled ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {connection.baseUrl}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Activity className="w-3.5 h-3.5" />
          <span>v{connection.version}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {connection.enabled && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={(e) => { e.stopPropagation(); handleDisable(); }} disabled={disableMut.isPending} title="Ngắt khẩn cấp">
              {disableMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary" onClick={(e) => { e.stopPropagation(); onEdit(connection); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(); }} disabled={deleteMut.isPending}>
            {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
