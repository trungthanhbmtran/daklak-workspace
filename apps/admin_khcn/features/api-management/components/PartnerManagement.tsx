'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Key, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function PartnerManagement() {
  const qc = useQueryClient();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const { data: partners, isLoading } = useQuery({
    queryKey: ['api-partners'],
    queryFn: async () => {
      const res = await apiClient.get('/api-management/partners');
      return res.data;
    },
  });

  // Tạo đối tác
  const createMut = useMutation({
    mutationFn: (data: { name: string; code: string }) =>
      apiClient.post('/api-management/partners', data),

    onSuccess: () => {
      toast.success('Tạo đối tác thành công');

      qc.invalidateQueries({
        queryKey: ['api-partners'],
      });

      setName('');
      setCode('');
      setOpen(false);
    },

    onError: () => {
      toast.error('Không thể tạo đối tác');
    },
  });

  // Cấp khóa API
  const issueKeyMut = useMutation({
    mutationFn: (partnerId: string) =>
      apiClient.post(`/api-management/partners/${partnerId}/keys`, {
        name: 'Khóa mặc định',
        scopes: ['*'],
      }),

    onSuccess: (res) => {
      // Khóa bí mật chỉ được hiển thị một lần
      alert(
        'ĐÂY LÀ KHÓA BÍ MẬT DUY NHẤT.\n' +
        'HÃY LƯU LẠI VÌ KHÓA NÀY SẼ KHÔNG BAO GIỜ ĐƯỢC HIỂN THỊ LẠI.\n\n' +
        res.data.oneTimeKey,
      );

      qc.invalidateQueries({
        queryKey: ['api-partners'],
      });
    },

    onError: () => {
      toast.error('Không thể cấp khóa API');
    },
  });

  // Thu hồi khóa API
  const revokeKeyMut = useMutation({
    mutationFn: (keyId: string) =>
      apiClient.put(`/api-management/partners/keys/${keyId}/revoke`),

    onSuccess: () => {
      toast.success('Đã thu hồi khóa API thành công');

      qc.invalidateQueries({
        queryKey: ['api-partners'],
      });
    },

    onError: () => {
      toast.error('Không thể thu hồi khóa API');
    },
  });

  if (isLoading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 mt-8 border-t pt-8">
      {/* Tiêu đề */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            Quản lý đối tác tích hợp
          </h2>

          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản và cấp khóa API cho các đối tác truy cập vào hệ
            thống
          </p>
        </div>

        {/* Tạo đối tác */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo đối tác
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo đối tác mới</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="Mã định danh (ví dụ: VNPOST)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <Input
                placeholder="Tên đối tác"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Button
                onClick={() =>
                  createMut.mutate({
                    name,
                    code,
                  })
                }
                disabled={createMut.isPending}
              >
                {createMut.isPending ? 'Đang tạo...' : 'Xác nhận'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách đối tác */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã / Tên đối tác</TableHead>
            <TableHead>Khóa API</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {partners?.map((p: any) => (
            <TableRow key={p.id}>
              {/* Thông tin đối tác */}
              <TableCell>
                <div className="font-semibold">{p.name}</div>

                <div className="text-xs font-mono text-slate-500">
                  {p.code}
                </div>
              </TableCell>

              {/* Danh sách khóa */}
              <TableCell>
                <div className="flex flex-col gap-2">
                  {p.keys?.map((k: any) => (
                    <div
                      key={k.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Key className="w-3 h-3" />

                      <span className="font-mono">
                        {k.keyPrefix}
                      </span>

                      <Badge
                        variant={
                          k.status === 'ACTIVE'
                            ? 'default'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {k.status === 'ACTIVE'
                          ? 'Đang hoạt động'
                          : 'Đã thu hồi'}
                      </Badge>

                      {k.status === 'ACTIVE' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-red-500 p-1"
                          onClick={() => revokeKeyMut.mutate(k.id)}
                          disabled={revokeKeyMut.isPending}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Thu hồi
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* Cấp khóa mới */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit h-7 mt-1"
                    onClick={() => issueKeyMut.mutate(p.id)}
                    disabled={issueKeyMut.isPending}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Cấp khóa mới
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

