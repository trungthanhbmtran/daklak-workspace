'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Key, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function PartnerManagement() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  
  const { data: partners, isLoading } = useQuery({
    queryKey: ['api-partners'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/api-management/partners');
      return res.data;
    }
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string, code: string }) => apiClient.post('/admin/api-management/partners', data),
    onSuccess: () => {
      toast.success('Tạo đối tác thành công');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
      setOpen(false);
    }
  });

  const issueKeyMut = useMutation({
    mutationFn: (partnerId: string) => apiClient.post(`/admin/api-management/partners/${partnerId}/keys`, { name: 'Default Key', scopes: ['*'] }),
    onSuccess: (res) => {
      // Show ONE-TIME key
      alert('ĐÂY LÀ MÃ BÍ MẬT DUY NHẤT. HÃY LƯU LẠI VÌ NÓ SẼ KHÔNG BAO GIỜ HIỂN THỊ LẠI:\n\n' + res.data.oneTimeKey);
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    }
  });

  const revokeKeyMut = useMutation({
    mutationFn: (keyId: string) => apiClient.put(`/admin/api-management/partners/keys/${keyId}/revoke`),
    onSuccess: () => {
      toast.success('Đã thu hồi khóa thành công');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    }
  });

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6 mt-8 border-t pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tài khoản Đối Tác (Inbound)</h2>
          <p className="text-sm text-muted-foreground">Cấp khóa API (API Key) cho các đối tác truy cập vào hệ thống</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Tạo đối tác</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tạo Đối Tác Mới</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Mã định danh (ví dụ: VNPOST)" value={code} onChange={e => setCode(e.target.value)} />
              <Input placeholder="Tên hiển thị" value={name} onChange={e => setName(e.target.value)} />
              <Button onClick={() => createMut.mutate({ name, code })}>Xác nhận</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã / Tên đối tác</TableHead>
            <TableHead>Khóa API (API Keys)</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners?.map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs font-mono text-slate-500">{p.code}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-2">
                  {p.keys?.map((k: any) => (
                    <div key={k.id} className="flex items-center gap-2 text-sm">
                      <Key className="w-3 h-3" />
                      <span className="font-mono">{k.keyPrefix}</span>
                      <Badge variant={k.status === 'ACTIVE' ? 'default' : 'destructive'} className="text-[10px]">{k.status}</Badge>
                      {k.status === 'ACTIVE' && (
                        <Button variant="ghost" size="sm" className="h-6 text-red-500 p-1" onClick={() => revokeKeyMut.mutate(k.id)}>
                          <Trash2 className="w-3 h-3" /> Thu hồi
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-fit h-7 mt-1" onClick={() => issueKeyMut.mutate(p.id)}>
                    <Plus className="w-3 h-3 mr-1" /> Cấp khóa mới
                  </Button>
                </div>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
