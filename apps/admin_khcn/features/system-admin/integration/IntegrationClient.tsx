"use client";

import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIntegrationList, useDeleteIntegration, useToggleActiveIntegration, IntegrationConfig } from './api';
import { IntegrationModal } from './IntegrationModal';

export function IntegrationClient() {
  const [search, setSearch] = useState('');
  const { data: integrations = [], isLoading } = useIntegrationList(search);
  const deleteMutation = useDeleteIntegration();
  const toggleMutation = useToggleActiveIntegration();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationConfig | null>(null);

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã liên thông này?')) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success('Xóa thành công');
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Lỗi khi xóa');
      }
    }
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    try {
      await toggleMutation.mutateAsync({ id, isActive: !currentStatus });
      toast.success('Cập nhật trạng thái thành công');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi cập nhật trạng thái');
    }
  };

  const openEdit = (item: IntegrationConfig) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm hệ thống..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="shrink-0 w-full sm:w-auto" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Thêm Mã liên thông
          </Button>
        </div>

        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hệ thống đối tác</TableHead>
                  <TableHead>Mã liên thông</TableHead>
                  <TableHead>Cấu hình (JSON)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : integrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">Không có dữ liệu</TableCell>
                  </TableRow>
                ) : (
                  integrations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.systemName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-slate-50">{item.integrationCode}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs font-mono text-slate-500">
                        {item.configData}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => handleToggle(item.id, item.isActive)}
                        >
                          {item.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Edit className="w-4 h-4 text-indigo-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <IntegrationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingItem} 
      />
    </div>
  );
}
