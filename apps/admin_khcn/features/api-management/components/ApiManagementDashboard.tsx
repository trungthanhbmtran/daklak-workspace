"use client";

import React, { useState } from "react";
import { useConnections, usePublishRevision } from "../hooks/useApiManagement";
import { Plus, Search, Network, CloudUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiConnectionCard } from "./ApiConnectionCard";
import { ApiConnectionDetail } from "./ApiConnectionDetail";
import { ApiImportWizard } from "./ApiImportWizard";
import { ApiConnectionCreateDialog } from "./ApiConnectionCreateDialog";

export function ApiManagementDashboard() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: connections, isLoading } = useConnections(search);
  const publishMut = usePublishRevision();

    if (selectedId) {
    return <ApiConnectionDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Cấu hình API Manager</h2>
          <p className="text-sm text-muted-foreground">Quản lý các kết nối Inbound/Outbound và cấu hình Gateway</p>
        </div>
        <div className="flex gap-2">
          <ApiImportWizard />
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => publishMut.mutate()}
            disabled={publishMut.isPending}
          >
            {publishMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CloudUpload className="w-4 h-4 mr-2" />}
            Publish lên Gateway
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm kết nối (mã, tên)..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ApiConnectionCreateDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-[200px] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : connections?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl bg-slate-50 dark:bg-slate-900/50">
          <div className="h-20 w-20 rounded-full bg-violet-100 flex items-center justify-center mb-4">
            <Network className="h-10 w-10 text-violet-500" />
          </div>
          <h3 className="text-lg font-semibold">Chưa có kết nối nào</h3>
          <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-4">
            Hệ thống chưa ghi nhận cấu hình API nào. Bạn có thể tự tạo hoặc Import file Swagger/OpenAPI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {connections?.map((conn) => (
            <div key={conn.id} onClick={() => setSelectedId(conn.id)} className="cursor-pointer"><ApiConnectionCard connection={conn} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

