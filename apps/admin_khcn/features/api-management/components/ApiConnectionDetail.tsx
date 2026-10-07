'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiManagementApi } from '../api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Clock, Lock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function ApiConnectionDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['api-connections', id],
    queryFn: () => apiManagementApi.getConnection(id)
  });

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
        <Badge variant={data.enabled ? "default" : "destructive"} className="ml-auto">
          {data.enabled ? "Đang hoạt động" : "Vô hiệu hóa"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-4 border rounded-xl bg-card space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Server className="w-4 h-4"/> Base URL</div>
          <p className="font-mono text-sm break-all">{data.baseUrl}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Lock className="w-4 h-4"/> Xác thực</div>
          <p className="font-mono text-sm uppercase">{data.auth?.kind || 'NONE'}</p>
        </div>
        <div className="p-4 border rounded-xl bg-card space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Clock className="w-4 h-4"/> Timeout</div>
          <p className="font-mono text-sm">{data.timeoutMs} ms</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Danh sách Endpoints</h3>
        <div className="border rounded-xl bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Method</TableHead>
                <TableHead>Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.endpoints?.map((ep: any) => (
                <TableRow key={ep.id}>
                  <TableCell className="font-mono font-medium text-xs">{ep.method}</TableCell>
                  <TableCell className="font-mono text-sm">{ep.pathTemplate}</TableCell>
                </TableRow>
              ))}
              {(!data.endpoints || data.endpoints.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    Chưa có endpoint nào được định nghĩa
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
