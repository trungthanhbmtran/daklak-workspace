"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useCreateIntegration, useUpdateIntegration } from './api';
import type { IntegrationConfig, LGSPConfigData, PostmanItem, PostmanHeader } from './api';
import { Copy, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
  const [lgspConfig, setLgspConfig] = useState<any>(DEFAULT_LGSP_CONFIG);

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

    let finalConfig = { ...lgspConfig };
    if (finalConfig.type === 'POSTMAN') {
      finalConfig.info = {
        name: systemName,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      };
      if (!finalConfig.item) finalConfig.item = [];
    }

    const configDataStr = JSON.stringify(finalConfig, null, 2);

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
    setLgspConfig((prev: any) => ({
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
    setLgspConfig((prev: any) => {
      const perms = prev.permissions || [];
      if (perms.includes(permId)) {
        return { ...prev, permissions: perms.filter((p: string) => p !== permId) };
      }
      return { ...prev, permissions: [...perms, permId] };
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã copy vào bộ nhớ tạm');
  };

  // --- POSTMAN HELPERS ---
  const postmanItems: PostmanItem[] = lgspConfig.item || [];

  const addPostmanItem = () => {
    const newItem: PostmanItem = {
      name: 'New Endpoint',
      request: {
        method: 'GET',
        header: [],
        url: { raw: '' }
      }
    };
    setLgspConfig({ ...lgspConfig, item: [...postmanItems, newItem] });
  };

  const removePostmanItem = (index: number) => {
    const newItems = [...postmanItems];
    newItems.splice(index, 1);
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const updatePostmanItem = (index: number, field: string, value: any) => {
    const newItems = [...postmanItems];
    (newItems[index] as any)[field] = value;
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const updatePostmanRequest = (index: number, field: string, value: any) => {
    const newItems = [...postmanItems];
    (newItems[index].request as any)[field] = value;
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const updatePostmanUrl = (index: number, value: string) => {
    const newItems = [...postmanItems];
    newItems[index].request.url = { ...newItems[index].request.url, raw: value };
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const addPostmanHeader = (index: number) => {
    const newItems = [...postmanItems];
    newItems[index].request.header.push({ key: '', value: '', type: 'text' });
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const removePostmanHeader = (itemIndex: number, headerIndex: number) => {
    const newItems = [...postmanItems];
    newItems[itemIndex].request.header.splice(headerIndex, 1);
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  const updatePostmanHeader = (itemIndex: number, headerIndex: number, field: keyof PostmanHeader, value: string) => {
    const newItems = [...postmanItems];
    newItems[itemIndex].request.header[headerIndex][field] = value;
    setLgspConfig({ ...lgspConfig, item: newItems });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Sửa cấu hình liên thông LGSP' : 'Tạo mới mã liên thông LGSP'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className={`grid w-full ${lgspConfig.type === 'POSTMAN' ? 'grid-cols-2' : 'grid-cols-4'}`}>
              <TabsTrigger value="general">Thông tin</TabsTrigger>
              {lgspConfig.type === 'POSTMAN' ? (
                <TabsTrigger value="postman">Cấu hình Postman</TabsTrigger>
              ) : (
                <>
                  <TabsTrigger value="outbound">Cấu hình gọi ra</TabsTrigger>
                  <TabsTrigger value="inbound">Cấu hình gọi vào</TabsTrigger>
                  <TabsTrigger value="permissions">Phân quyền</TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Tên hệ thống đối tác / Tên cấu hình</label>
                <Input
                  required
                  value={systemName}
                  onChange={e => setSystemName(e.target.value)}
                  placeholder="Ví dụ: Cấu hình Thống kê"
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
                    <SelectItem value="POSTMAN">Postman Collection API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {lgspConfig.type === 'POSTMAN' ? (
              <TabsContent value="postman" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Danh sách Endpoints (Items)</p>
                  <Button type="button" size="sm" onClick={addPostmanItem}><Plus className="w-4 h-4 mr-2" /> Thêm Endpoint</Button>
                </div>
                <div className="space-y-4">
                  {postmanItems.map((item, index) => (
                    <Card key={index} className="p-4 space-y-3 relative border-slate-300 shadow-sm">
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 hover:text-red-700" onClick={() => removePostmanItem(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div className="grid grid-cols-12 gap-3 pr-8">
                        <div className="col-span-12 sm:col-span-4 space-y-1">
                          <label className="text-xs font-semibold">Tên chức năng (Name)</label>
                          <Input value={item.name} onChange={e => updatePostmanItem(index, 'name', e.target.value)} placeholder="Ví dụ: TK VB" />
                        </div>
                        <div className="col-span-12 sm:col-span-3 space-y-1">
                          <label className="text-xs font-semibold">Method</label>
                          <Select value={item.request.method} onValueChange={v => updatePostmanRequest(index, 'method', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-12 sm:col-span-5 space-y-1">
                          <label className="text-xs font-semibold">URL (Raw)</label>
                          <Input value={item.request.url.raw} onChange={e => updatePostmanUrl(index, e.target.value)} placeholder="http://10.50.1.14:2312/..." className="font-mono text-xs" />
                        </div>
                      </div>
                      <div className="space-y-2 mt-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-500">Headers / Params</label>
                          <Button type="button" variant="outline" size="sm" onClick={() => addPostmanHeader(index)} className="h-7 text-xs">+ Thêm Header</Button>
                        </div>
                        {item.request.header?.map((hdr, hIndex) => (
                          <div key={hIndex} className="flex gap-2 items-center">
                            <Input className="flex-1 font-mono text-xs" placeholder="Key (vd: startdate)" value={hdr.key} onChange={e => updatePostmanHeader(index, hIndex, 'key', e.target.value)} />
                            <Input className="flex-1 font-mono text-xs" placeholder="Value (vd: 2026-05-30)" value={hdr.value} onChange={e => updatePostmanHeader(index, hIndex, 'value', e.target.value)} />
                            <Select value={hdr.type || 'text'} onValueChange={v => updatePostmanHeader(index, hIndex, 'type', v)}>
                              <SelectTrigger className="w-[100px] text-xs h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">text</SelectItem>
                                <SelectItem value="default">default</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removePostmanHeader(index, hIndex)}><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" /></Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  {postmanItems.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-lg text-slate-500">
                      Chưa có endpoint nào. Hãy bấm "Thêm Endpoint" để tạo cấu hình.
                    </div>
                  )}
                </div>
              </TabsContent>
            ) : (
              <>
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
              </>
            )}
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
