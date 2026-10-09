'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiManagementApi } from '../api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Server, Clock, Lock, Pencil, Power, PowerOff, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUpdateConnection } from '../hooks/useApiManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function ApiConnectionDetail({ id, onBack }: { id: string, onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['api-connections', id],
    queryFn: () => apiManagementApi.getConnection(id)
  });

  const updateMut = useUpdateConnection();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authKind, setAuthKind] = useState<string>('none');
  const [authSecret, setAuthSecret] = useState<string>('');

  useEffect(() => {
    if (data?.auth) {
      setAuthKind(data.auth.kind || 'none');
    }
  }, [data]);

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

  const handleUpdateAuth = () => {
    if (!data) return;
    updateMut.mutate({
      id,
      data: {
        auth: {
          kind: authKind as any,
          ...(authSecret ? { secret: authSecret } : {})
        },
        expectedVersion: data.version
      }
    }, {
      onSuccess: () => {
        setAuthDialogOpen(false);
        setAuthSecret('');
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
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thay đổi thông tin xác thực</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Loại xác thực</Label>
                    <Select value={authKind} onValueChange={setAuthKind}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại xác thực" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Không xác thực (None)</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                        <SelectItem value="apiKey">API Key (Header)</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="mtls">mTLS (Chứng thư số)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {authKind !== 'none' && (
                    <div className="grid gap-2">
                      <Label>Secret / Token / API Key</Label>
                      <Input 
                        type="password" 
                        value={authSecret} 
                        onChange={e => setAuthSecret(e.target.value)} 
                        placeholder={data.auth?.secretRef ? "(Đã thiết lập - nhập để thay đổi)" : "Nhập secret key..."} 
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAuthDialogOpen(false)}>Hủy</Button>
                  <Button onClick={handleUpdateAuth} disabled={updateMut.isPending}>
                    {updateMut.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Lưu thay đổi
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
