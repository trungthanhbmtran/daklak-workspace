"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Network, Plus, Trash2, Loader2 } from "lucide-react";

export function ServicesTab() {
  const queryClient = useQueryClient();
  const [newService, setNewService] = useState({ name: '', url: '', description: '' });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['gateway', 'services'],
    queryFn: gatewayApi.getServices
  });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createService,
    onSuccess: () => {
      toast.success('Đã thêm Service mới');
      setNewService({ name: '', url: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['gateway', 'services'] });
    },
    onError: () => toast.error('Lỗi khi thêm Service')
  });

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteService,
    onSuccess: () => {
      toast.success('Đã xóa Service');
      queryClient.invalidateQueries({ queryKey: ['gateway', 'services'] });
      // Invalidate routes too
      queryClient.invalidateQueries({ queryKey: ['gateway', 'routes'] });
    },
    onError: () => toast.error('Lỗi khi xóa')
  });

  const handleCreate = () => {
    if (!newService.name || !newService.url) return toast.error('Vui lòng nhập tên và URL');
    createMutation.mutate(newService);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa? Các route liên kết sẽ bị xóa theo!')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      <Card className="shrink-0 border-none shadow-sm rounded-md overflow-hidden bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Network className="w-5 h-5 text-blue-500" /> Thêm mới Service Upstream
          </CardTitle>
          <CardDescription>
            Đăng ký địa chỉ của Microservice nội bộ (VD: gRPC hoặc HTTP service) để Gateway định tuyến.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="space-y-2 md:col-span-3">
              <Label className="text-slate-600">Mã Service (Name)</Label>
              <Input className="h-10 rounded-md bg-white border-slate-200 focus-visible:ring-blue-500" placeholder="user-service" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-6">
              <Label className="text-slate-600">Địa chỉ URL nội bộ (Target URL)</Label>
              <Input className="h-10 rounded-md bg-white border-slate-200 focus-visible:ring-blue-500 font-mono text-sm" placeholder="http://user-service:50051" value={newService.url} onChange={e => setNewService({...newService, url: e.target.value})} />
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-10 md:col-span-3 rounded-md bg-blue-600 hover:bg-blue-700 shadow-sm text-white w-full">
              {createMutation.isPending ? <Loader2 className="w-5 h-5 mr-1.5 animate-spin" /> : <Plus className="w-5 h-5 mr-1.5" />}
              Khởi tạo Service
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <h3 className="shrink-0 text-lg font-semibold text-slate-800 mb-4 px-2">Danh sách Services ({services.length})</h3>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map(s => (
            <Card key={s.id} className="group relative border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 rounded-md overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Network className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{s.name}</h4>
                      <span className="flex items-center gap-1.5 text-xs font-medium mt-1 text-emerald-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} disabled={deleteMutation.isPending} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full">
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-md p-3 flex items-center gap-3 overflow-hidden">
                  <div className="flex-1 truncate font-mono text-sm text-slate-600">
                    {s.url}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>ID: #{s.id}</span>
                  <span>{(s as any).routes?.length || 0} routes liên kết</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-md border border-dashed border-slate-200">
              <Network className="w-12 h-12 mb-3 text-slate-300" />
              <p>Chưa có Service nào được định nghĩa</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
