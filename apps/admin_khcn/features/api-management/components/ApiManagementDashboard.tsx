"use client";

import React, { useState } from "react";
import { useConnections, usePublishRevision } from "../hooks/useApiManagement";
import { Plus, Search, Network, CloudUpload, Loader2, ActivitySquare, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiConnectionCard } from "./ApiConnectionCard";
import { ApiConnectionDetail } from "./ApiConnectionDetail";
import { ApiImportWizard } from "./ApiImportWizard";
import { ApiConnectionCreateDialog } from "./ApiConnectionCreateDialog";
import { ApiConnectionEditDialog } from "./ApiConnectionEditDialog";
import { ApiConnection } from "../api";

export function ApiManagementDashboard() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingConnection, setEditingConnection] = useState<ApiConnection | null>(null);
  const { data: connections, isLoading } = useConnections(search);
  const publishMut = usePublishRevision();

  if (selectedId) {
    return <ApiConnectionDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  const activeCount = connections?.filter(c => c.enabled).length || 0;
  const inactiveCount = (connections?.length || 0) - activeCount;

  return (
    <div className="flex flex-col space-y-6">
      {/* Cụm thông kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tổng API kết nối</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{connections?.length || 0}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl">
            <ActivitySquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Đang hoạt động (Active)</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tạm ngưng (Disabled)</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{inactiveCount}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm API theo mã hoặc tên..." 
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-transparent focus-visible:ring-primary/20 rounded-xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <ApiConnectionCreateDialog />
          <ApiImportWizard />
          <Button 
            variant="default" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm h-11 px-5 rounded-xl transition-all"
            onClick={() => publishMut.mutate()}
            disabled={publishMut.isPending}
          >
            {publishMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2" />}
            Publish Gateway
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-[220px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : connections?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 mt-4">
          <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 shadow-sm">
            <Network className="h-12 w-12 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Không tìm thấy kết nối nào</h3>
          <p className="text-slate-500 text-base max-w-md mt-2 mb-6">
            Hệ thống chưa ghi nhận cấu hình API nào khớp với tìm kiếm. Bạn có thể tự tạo hoặc Import file Swagger/OpenAPI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {connections?.map((conn) => (
            <div key={conn.id} onClick={() => setSelectedId(conn.id)} className="cursor-pointer h-full">
              <ApiConnectionCard connection={conn} onEdit={(c) => setEditingConnection(c)} />
            </div>
          ))}
        </div>
      )}

      {editingConnection && (
        <ApiConnectionEditDialog 
          connection={editingConnection} 
          open={!!editingConnection} 
          onOpenChange={(open) => !open && setEditingConnection(null)} 
        />
      )}
    </div>
  );
}

