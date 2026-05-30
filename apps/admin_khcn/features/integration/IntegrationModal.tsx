"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useCreateIntegration, useUpdateIntegration } from './api';
import type { IntegrationConfig, LGSPConfigData } from './api';
import { Copy, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IntegrationConfig | null;
}

const DEFAULT_LGSP_CONFIG: LGSPConfigData = {
  type: 'LGSP',
  apiUrl: '',
  apiToken: '',
  keys: {
    clientId: '',
    clientSecret: '',
    publicKey: '',
    privateKey: ''
  },
  permissions: []
};

export function IntegrationModal({ isOpen, onClose, initialData }: Props) {
  const [systemName, setSystemName] = useState('');
  const [integrationCode, setIntegrationCode] = useState('');
  const [lgspConfig, setLgspConfig] = useState<LGSPConfigData>(DEFAULT_LGSP_CONFIG);

  const availablePermissions = [
    { id: 'READ_USERS', label: 'Đọc dữ liệu Người dùng' },
    { id: 'SYNC_HRM', label: 'Đồng bộ Nhân sự' },
    { id: 'READ_DOCUMENTS', label: 'Lấy danh sách Văn bản' },
    { id: 'WRITE_DOCUMENTS', label: 'Đẩy Văn bản đến' },
    { id: 'READ_POSTS', label: 'Lấy tin tức' }
  ];

  useEffect(() => {
    if (isOpen) {
      setSystemName(initialData?.systemName || '');
      setIntegrationCode(initialData?.integrationCode || `LGSP_${Math.floor(Math.random() * 100000)}`);

      if (initialData?.configData) {
        try {
          const parsed = JSON.parse(initialData.configData);
          setLgspConfig({ ...DEFAULT_LGSP_CONFIG, ...parsed });
        } catch {
          setLgspConfig(DEFAULT_LGSP_CONFIG);
        }
      } else {
        setLgspConfig(DEFAULT_LGSP_CONFIG);
      }
    }
  }, [isOpen, initialData]);

  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const configDataStr = JSON.stringify(lgspConfig, null, 2);

    try {
      if (initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, systemName, integrationCode, configData: configDataStr });
        toast.success('Cập nhật thành công');
      } else {
        await createMutation.mutateAsync({ systemName, integrationCode, configData: configDataStr });
        toast.success('Tạo mới thành công');
      }
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Lỗi khi lưu');
    }
  };

  const generateKeys = () => {
    const generateHex = (len: number) => Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setLgspConfig(prev => ({
      ...prev,
      keys: {
        clientId: `client_${generateHex(16)}`,
        clientSecret: `sec_${generateHex(32)}`,
        publicKey: `-----BEGIN PUBLIC KEY-----\n${generateHex(64)}\n-----END PUBLIC KEY-----`,
        privateKey: `-----BEGIN PRIVATE KEY-----\n${generateHex(128)}\n-----END PRIVATE KEY-----`,
      }
    }));
  };

  const togglePermission = (permId: string) => {
    setLgspConfig(prev => {
      const perms = prev.permissions || [];
      if (perms.includes(permId)) {
        return { ...prev, permissions: perms.filter(p => p !== permId) };
      }
      return { ...prev, permissions: [...perms, permId] };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã copy vào bộ nhớ tạm');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Sửa cấu hình liên thông LGSP' : 'Tạo mới mã liên thông LGSP'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Thông tin</TabsTrigger>
              <TabsTrigger value="outbound">Cấu hình gọi ra</TabsTrigger>
              <TabsTrigger value="inbound">Cấu hình gọi vào</TabsTrigger>
              <TabsTrigger value="permissions">Phân quyền</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tên hệ thống đối tác</label>
                <Input
                  required
                  value={systemName}
                  onChange={e => setSystemName(e.target.value)}
                  placeholder="Ví dụ: Trục LGSP Tỉnh Daklak"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Mã định danh (Integration Code)</label>
                <Input
                  required
                  value={integrationCode}
                  onChange={e => setIntegrationCode(e.target.value)}
                  placeholder="Mã định danh duy nhất"
                  className="font-mono bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Loại liên thông</label>
                <Select
                  value={lgspConfig.type}
                  onValueChange={(val: any) => setLgspConfig({ ...lgspConfig, type: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại liên thông" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LGSP">Trục LGSP Địa phương</SelectItem>
                    <SelectItem value="SYSTEM">System-to-System</SelectItem>
                    <SelectItem value="WEBHOOK">Webhook Callback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="outbound" className="space-y-4 mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Cấu hình để hệ thống của chúng ta gọi ra dịch vụ của đối tác (Outbound).</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Endpoint (API URL)</label>
                  <Input
                    value={lgspConfig.apiUrl || ''}
                    onChange={e => setLgspConfig({ ...lgspConfig, apiUrl: e.target.value })}
                    placeholder="VD: https://api.doitac.com/v1"
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Token / Cặp Key xác thực (API Token)</label>
                  <Input
                    value={lgspConfig.apiToken || ''}
                    onChange={e => setLgspConfig({ ...lgspConfig, apiToken: e.target.value })}
                    placeholder="Bearer token hoặc mã bí mật"
                    className="font-mono text-sm"
                    type="password"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inbound" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Cặp khóa dùng để xác thực hệ thống bên ngoài gọi vào API Gateway.</p>
                <Button type="button" variant="outline" size="sm" onClick={generateKeys}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Sinh khóa mới
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Client ID</label>
                  <div className="flex gap-2">
                    <Input readOnly value={lgspConfig.keys?.clientId || ''} className="font-mono text-xs bg-slate-50" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(lgspConfig.keys?.clientId || '')}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Client Secret</label>
                  <div className="flex gap-2">
                    <Input readOnly value={lgspConfig.keys?.clientSecret || ''} className="font-mono text-xs bg-slate-50" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(lgspConfig.keys?.clientSecret || '')}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Public Key</label>
                  <div className="flex gap-2">
                    <Input readOnly value={lgspConfig.keys?.publicKey || ''} className="font-mono text-xs bg-slate-50" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(lgspConfig.keys?.publicKey || '')}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Private Key</label>
                  <div className="flex gap-2">
                    <Input readOnly value={lgspConfig.keys?.privateKey || ''} className="font-mono text-xs bg-slate-50" type="password" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(lgspConfig.keys?.privateKey || '')}><Copy className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">Chọn các nhóm dữ liệu mà hệ thống này được phép truy cập thông qua LGSP.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-md">
                {availablePermissions.map(perm => (
                  <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      checked={(lgspConfig.permissions || []).includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                    />
                    <span className="text-sm">{perm.label}</span>
                  </label>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Hủy</Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              Lưu cấu hình
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
