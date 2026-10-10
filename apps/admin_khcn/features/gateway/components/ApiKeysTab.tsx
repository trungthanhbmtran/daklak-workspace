/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiKey, gatewayApi } from "../api/gateway.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldAlert, Key, Trash2, CheckCircle2, Copy, Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ApiKeysTab() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '' });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['gateway', 'apikeys'],
    queryFn: gatewayApi.getApiKeys
  });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createApiKey,
    onSuccess: () => {
      toast.success('Đã tạo API Key thành công!');
      setNewApiKey({ name: '', description: '' });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['gateway', 'apikeys'] });
    },
    onError: () => toast.error('Lỗi khi tạo API Key')
  });

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteApiKey,
    onSuccess: () => {
      toast.success('Đã thu hồi API Key');
      queryClient.invalidateQueries({ queryKey: ['gateway', 'apikeys'] });
    },
    onError: () => toast.error('Lỗi khi thu hồi')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ApiKey> }) => gatewayApi.updateApiKey(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gateway', 'apikeys'] });
    },
    onError: () => toast.error('Lỗi khi cập nhật trạng thái')
  });

  const handleCreate = () => {
    if (!newApiKey.name) return toast.error('Vui lòng nhập tên ứng dụng');
    createMutation.mutate(newApiKey);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc muốn thu hồi (xóa) khóa này? Các khách hàng đang sử dụng sẽ bị chặn truy cập lập tức!')) return;
    deleteMutation.mutate(id);
  };

  const toggleStatus = (key: ApiKey, isActive: boolean) => {
    updateMutation.mutate({ id: key.id, data: { isActive } });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    toast.success("Đã sao chép khóa API");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">API Keys (Credentials)</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý cấp phát và thu hồi Khóa bảo mật cho các đối tác / hệ thống ngoài.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Tạo API Key Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary" /> Khởi tạo Khóa bảo mật</DialogTitle>
              <DialogDescription>
                Khóa bí mật được dùng để xác thực hệ thống bên thứ 3. Vui lòng gửi khóa cho đối tác qua kênh an toàn.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Đơn vị / Tên hệ thống</Label>
                <Input placeholder="e.g. Hệ thống LGSP Tỉnh..." value={newApiKey.name} onChange={e => setNewApiKey({...newApiKey, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Mục đích sử dụng (Mô tả)</Label>
                <Input placeholder="e.g. Tích hợp lấy số liệu báo cáo..." value={newApiKey.description} onChange={e => setNewApiKey({...newApiKey, description: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Khởi tạo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden bg-card border border-border shadow-sm rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar h-full pr-2">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {apiKeys.map(k => (
                <Card key={k.id} className="relative overflow-hidden group border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 bg-background">
                  <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${k.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}></div>
                  
                  <CardHeader className="pb-4 pt-5 pl-7 pr-5">
                    <div className="flex justify-between items-start">
                      <div className="pr-4">
                        <CardTitle className="text-lg text-foreground font-semibold leading-tight">{k.name}</CardTitle>
                        <CardDescription className="mt-1.5 text-sm text-muted-foreground line-clamp-2" title={k.description || ''}>
                          {k.description || 'Không có mô tả'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3 bg-muted/50 px-3 py-1.5 rounded-full border border-border shrink-0">
                        <Switch checked={k.isActive} onCheckedChange={(v) => toggleStatus(k, v)} disabled={updateMutation.isPending} />
                        <div className="w-[1px] h-4 bg-border"></div>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)} disabled={deleteMutation.isPending} className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                          {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pl-7 pr-5 pb-6">
                    <div className="mt-2">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">X-API-KEY Token</Label>
                      <div className="relative group/copy">
                        <div className="bg-muted/30 text-foreground px-4 py-3 pr-12 rounded-lg font-mono text-sm break-all leading-relaxed border border-border shadow-inner">
                          {k.isActive ? k.key : <span className="text-muted-foreground italic line-through">Key đã bị vô hiệu hóa</span>}
                        </div>
                        {k.isActive && (
                          <Button 
                            variant="secondary"
                            onClick={() => copyToClipboard(k.key)} 
                            className="absolute right-1.5 top-1.5 h-auto py-1.5 px-2.5 bg-background hover:bg-muted text-muted-foreground border border-border rounded-md shadow-sm transition-all"
                          >
                            {copiedKey === k.key ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {apiKeys.length === 0 && (
                <div className="col-span-full h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Key className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="font-medium text-lg text-foreground">Chưa có API Key nào được cấp phát</p>
                  <p className="text-sm mt-1">Bấm "Tạo API Key Mới" để bắt đầu cấp quyền truy cập.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
