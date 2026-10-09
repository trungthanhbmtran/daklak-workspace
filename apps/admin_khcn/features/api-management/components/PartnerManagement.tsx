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
import { Key, Plus, Trash2, Search, Building2, ShieldCheck, Loader2 } from 'lucide-react';
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
  const [search, setSearch] = useState('');

  const { data: partners, isLoading } = useQuery({
    queryKey: ['api-partners'],
    queryFn: async () => {
      const res = await apiClient.get('/api-management/partners');
      return res.data;
    },
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; code: string }) =>
      apiClient.post('/api-management/partners', data),

    onSuccess: () => {
      toast.success('Tạo đối tác thành công');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
      setName('');
      setCode('');
      setOpen(false);
    },
    onError: () => {
      toast.error('Không thể tạo đối tác');
    },
  });

  const issueKeyMut = useMutation({
    mutationFn: (partnerId: string) =>
      apiClient.post(`/api-management/partners/${partnerId}/keys`, {
        name: 'Khóa mặc định',
        scopes: ['*'],
      }),
    onSuccess: (res) => {
      alert(
        'ĐÂY LÀ KHÓA BÍ MẬT DUY NHẤT.\n' +
        'HÃY LƯU LẠI VÌ KHÓA NÀY SẼ KHÔNG BAO GIỜ ĐƯỢC HIỂN THỊ LẠI.\n\n' +
        res.data.oneTimeKey,
      );
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    },
    onError: () => {
      toast.error('Không thể cấp khóa API');
    },
  });

  const revokeKeyMut = useMutation({
    mutationFn: (keyId: string) =>
      apiClient.put(`/api-management/partners/keys/${keyId}/revoke`),
    onSuccess: () => {
      toast.success('Đã thu hồi khóa API thành công');
      qc.invalidateQueries({ queryKey: ['api-partners'] });
    },
    onError: () => {
      toast.error('Không thể thu hồi khóa API');
    },
  });

  const filteredPartners = partners?.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm đối tác (mã, tên)..." 
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-800/50 border-transparent focus-visible:ring-primary/20 rounded-xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 h-11 px-5 rounded-xl shadow-sm w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm Đối tác
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Tạo đối tác tích hợp mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mã định danh (Code)</label>
                <Input
                  placeholder="Ví dụ: VNPOST, VNPT..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên hiển thị</label>
                <Input
                  placeholder="Tên đầy đủ của đối tác"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button
                className="w-full h-11 mt-2"
                onClick={() => createMut.mutate({ name, code })}
                disabled={createMut.isPending || !name || !code}
              >
                {createMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {createMut.isPending ? 'Đang tạo...' : 'Xác nhận tạo mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            Đang tải dữ liệu đối tác...
          </div>
        ) : filteredPartners?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Không tìm thấy đối tác nào</h3>
            <p className="text-slate-500 text-sm max-w-sm mt-1">
              Bạn có thể thêm đối tác mới để cấp phát API Key cho họ truy cập vào hệ thống.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 px-6 w-[40%]">Thông tin Đối tác</TableHead>
                  <TableHead className="font-semibold text-slate-900 dark:text-slate-100 py-4 px-6">Quản lý Khóa API (API Keys)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners?.map((p: any) => (
                  <TableRow key={p.id} className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-base">{p.name}</div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            {p.code}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-3">
                        {p.keys?.length > 0 ? (
                          <div className="space-y-2">
                            {p.keys.map((k: any) => (
                              <div key={k.id} className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/50 group">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-white dark:bg-slate-700 rounded-md shadow-sm">
                                    <Key className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                  </div>
                                  <div>
                                    <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-200 block">
                                      {k.keyPrefix}••••••••
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`mt-1 text-[10px] px-1.5 py-0 ${
                                        k.status === 'ACTIVE'
                                          ? 'border-green-200 text-green-700 bg-green-50 dark:border-green-900 dark:text-green-400 dark:bg-green-900/20'
                                          : 'border-red-200 text-red-700 bg-red-50 dark:border-red-900 dark:text-red-400 dark:bg-red-900/20'
                                      }`}
                                    >
                                      {k.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã thu hồi'}
                                    </Badge>
                                  </div>
                                </div>

                                {k.status === 'ACTIVE' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      if (confirm('Bạn có chắc chắn muốn thu hồi khóa này? Các kết nối đang sử dụng khóa này sẽ bị từ chối ngay lập tức.')) {
                                        revokeKeyMut.mutate(k.id);
                                      }
                                    }}
                                    disabled={revokeKeyMut.isPending}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1.5" />
                                    Thu hồi
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic">
                            Chưa có khóa API nào được cấp
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-fit h-8 border-dashed border-slate-300 hover:border-primary hover:text-primary dark:border-slate-700"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn cấp khóa API mới cho đối tác ${p.name}?`)) {
                              issueKeyMut.mutate(p.id);
                            }
                          }}
                          disabled={issueKeyMut.isPending}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Cấp khóa mới
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

