"use client";

import React, { useState, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationList, useDeleteIntegration, useToggleActiveIntegration, IntegrationConfig } from './api';
import { IntegrationModal } from './';
import { ApiMonitorDashboard } from './components/ApiMonitorDashboard';
import { ConfirmDeleteModal } from '@/shared/ConfirmDeleteModal';

export function IntegrationClient() {
  const [search, setSearch] = useState('');
  const { data: integrations = [], isLoading } = useIntegrationList(search);
  const deleteMutation = useDeleteIntegration();
  const toggleMutation = useToggleActiveIntegration();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationConfig | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [prefillData, setPrefillData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.info && json.item) {
          setPrefillData(json);
          setEditingItem(null);
          setIsModalOpen(true);
        } else {
          toast.error("File JSON không đúng định dạng Postman Collection");
        }
      } catch (err) {
        toast.error("Lỗi khi đọc file JSON");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete);
      toast.success('Xóa thành công');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi xóa');
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
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
    setPrefillData(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setPrefillData(null);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <Tabs defaultValue="manage" className="flex flex-col gap-6">
      <TabsList className="w-fit">
        <TabsTrigger value="manage">Quản lý cấu hình</TabsTrigger>
        <TabsTrigger value="monitor">Giám sát Dữ liệu</TabsTrigger>
      </TabsList>

      <TabsContent value="manage" className="flex-1 space-y-4 m-0">
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
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <Button variant="outline" className="shrink-0 w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
              Nhập từ Postman
            </Button>
            <Button className="shrink-0 w-full sm:w-auto" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Thêm Mã liên thông
            </Button>
          </div>
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
      </TabsContent>

      <TabsContent value="monitor" className="m-0">
        <ApiMonitorDashboard integrations={integrations} />
      </TabsContent>

      <IntegrationModal
        key={isModalOpen ? (editingItem?.id || 'new') : 'closed'}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setPrefillData(null); }}
        initialData={editingItem}
        prefillData={prefillData}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa tích hợp"
        description="Bạn có chắc chắn muốn xóa mã liên thông này? Hành động này không thể hoàn tác."
        isDeleting={deleteMutation.isPending}
      />
    </Tabs>
  );
}
