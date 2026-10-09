'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiManagementApi } from '../api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Clock, Lock, Pencil, Power, PowerOff, Loader2 } from 'lucide-react';
import { useUpdateConnection } from '../hooks/useApiManagement';
import dynamic from 'next/dynamic';

const ApiConnectionAuthDialog = dynamic(() => import('./ApiConnectionAuthDialog'), { ssr: false });
const ApiConnectionEndpoints = dynamic(() => import('./ApiConnectionEndpoints'), { ssr: false });

export function ApiConnectionDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['api-connections', id],
    queryFn: () => apiManagementApi.getConnection(id)
  });

  const updateMut = useUpdateConnection();

  const toggleStatus = () => {
    if (!data) return;
    updateMut.mutate({
      id,
      data: {
        enabled: !data.enabled,
        expectedVersion: data.version
      }
    });
  };

  if (isLoading) return <div className="p-8 animate-pulse">Đang tải cấu hình API...</div>;
  if (!data) return <div className="p-8 text-red-500">Không tìm thấy kết nối API.</div>;

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">{data.displayName}</h2>
          <p className="text-sm text-muted-foreground font-mono">{data.code}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={data.enabled ? "default" : "destructive"}>
            {data.enabled ? "Đang hoạt động" : "Vô hiệu hóa"}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleStatus}
            disabled={updateMut.isPending}
            className={data.enabled ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
          >
            {updateMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
             data.enabled ? <PowerOff className="w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
            {data.enabled ? "Tắt kết nối" : "Bật kết nối"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-xl bg-card space-y-2 relative group">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Server className="w-4 h-4"/> Base URL</div>
          <p className="font-mono text-sm break-all">{data.baseUrl}</p>
        </div>
        
        <div className="p-4 border rounded-xl bg-card space-y-2 relative group">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4"/> Xác thực</div>
            <ApiConnectionAuthDialog id={id} data={data} />
          </div>
          <p className="font-mono text-sm uppercase">
            {data.auth?.kind || 'NONE'}
            {data.auth?.secretRef ? ' (Đã cấu hình Secret)' : ''}
          </p>
        </div>

        <div className="p-4 border rounded-xl bg-card space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Clock className="w-4 h-4"/> Timeout</div>
          <p className="font-mono text-sm">{data.timeoutMs} ms</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Danh sách Endpoints</h3>
        <ApiConnectionEndpoints endpoints={data.endpoints} />
      </div>
    </div>
  );
}
