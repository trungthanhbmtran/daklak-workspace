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
import { ShieldAlert, Key, Trash2, CheckCircle2, Copy, Loader2 } from "lucide-react";

export function ApiKeysTab() {
  const queryClient = useQueryClient();
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
    if (!confirm('Bạn có chắc muốn thu hồi (xóa) khóa này? Khách hàng sẽ bị chặn truy cập lập tức!')) return;
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

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      <Card className="shrink-0 border-none shadow-sm rounded-md overflow-hidden bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border pb-6 relative overflow-hidden">
          <CardTitle className="flex items-center gap-2 text-xl relative z-10 text-foreground">
            <ShieldAlert className="w-5 h-5 text-primary" /> Khởi tạo Khóa bảo mật (API Key)
          </CardTitle>
          <CardDescription className="text-muted-foreground relative z-10">
            Khóa bí mật được dùng để xác thực các hệ thống thứ 3 khi gọi vào Gateway. Vui lòng bảo mật tuyệt đối.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="space-y-2 md:col-span-4">
              <Label className="text-foreground">Đơn vị / Tên hệ thống</Label>
              <Input className="h-10 rounded-md bg-background border-input focus-visible:ring-primary" placeholder="Hệ thống LGSP Tỉnh..." value={newApiKey.name} onChange={e => setNewApiKey({...newApiKey, name: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-5">
              <Label className="text-foreground">Mục đích sử dụng (Mô tả)</Label>
              <Input className="h-10 rounded-md bg-background border-input focus-visible:ring-primary" placeholder="Tích hợp lấy số liệu báo cáo..." value={newApiKey.description} onChange={e => setNewApiKey({...newApiKey, description: e.target.value})} />
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-10 md:col-span-3 rounded-md bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground w-full">
              {createMutation.isPending ? <Loader2 className="w-5 h-5 mr-1.5 animate-spin" /> : <Key className="w-5 h-5 mr-1.5" />}
              Tạo Key Mới
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {apiKeys.map(k => (
          <Card key={k.id} className="relative overflow-hidden group border border-border rounded-md shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 bg-card">
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${k.isActive ? 'bg-primary' : 'bg-muted'}`}></div>
            
            <CardHeader className="pb-4 pt-5 pl-7 pr-5">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-foreground">{k.name}</CardTitle>
                  <CardDescription className="mt-1.5 text-sm text-muted-foreground">{k.description}</CardDescription>
                </div>
                <div className="flex items-center gap-4 bg-muted/30 px-3 py-2 rounded-md border border-border">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${k.isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {k.isActive ? 'BẬT' : 'TẮT'}
                    </span>
                    <Switch checked={k.isActive} onCheckedChange={(v) => toggleStatus(k, v)} disabled={updateMutation.isPending} />
                  </div>
                  <div className="w-px h-6 bg-border"></div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(k.id)} disabled={deleteMutation.isPending} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pl-7 pr-5 pb-6">
              <div className="mt-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">X-API-KEY Token</Label>
                <div className="relative group/copy">
                  <div className="bg-muted/30 text-foreground p-4 pr-14 rounded-md font-mono text-sm break-all leading-relaxed border border-border">
                    {k.isActive ? k.key : <span className="text-muted-foreground italic">Key đã bị vô hiệu hóa</span>}
                  </div>
                  {k.isActive && (
                    <Button 
                      variant="secondary"
                      onClick={() => copyToClipboard(k.key)} 
                      className="absolute right-2 top-2 h-auto py-2 bg-background hover:bg-muted text-muted-foreground border border-border rounded-md shadow-sm"
                    >
                      {copiedKey === k.key ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {apiKeys.length === 0 && (
           <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground bg-muted/30 rounded-md border border-dashed border-border">
             <ShieldAlert className="w-12 h-12 mb-3 text-muted-foreground/50" />
             <p className="font-medium">Chưa có API Key nào được cấp phát</p>
             <p className="text-sm mt-1">Sử dụng form bên trên để tạo mới</p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
