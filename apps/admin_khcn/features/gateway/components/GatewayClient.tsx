"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { GatewayService, GatewayRoute, ApiKey, gatewayApi } from "../api/gateway.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Key, Network, Route as RouteIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GatewayClient() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<GatewayService[]>([]);
  const [routes, setRoutes] = useState<GatewayRoute[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  // Form states for simple creation
  const [newService, setNewService] = useState({ name: '', url: '', description: '' });
  const [newRoute, setNewRoute] = useState({ path: '', serviceId: '', methods: 'GET,POST,PUT,DELETE,PATCH', stripPath: true });
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [svc, rts, keys] = await Promise.all([
        gatewayApi.getServices(),
        gatewayApi.getRoutes(),
        gatewayApi.getApiKeys()
      ]);
      setServices(svc);
      setRoutes(rts);
      setApiKeys(keys);
    } catch (error) {
      toast.error("Không thể tải cấu hình Gateway");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    try {
      if (!newService.name || !newService.url) return toast.error('Vui lòng nhập tên và URL');
      await gatewayApi.createService(newService);
      toast.success('Đã thêm Service mới');
      setNewService({ name: '', url: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi thêm Service');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa? Các route liên kết sẽ bị xóa theo!')) return;
    try {
      await gatewayApi.deleteService(id);
      toast.success('Đã xóa Service');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleCreateRoute = async () => {
    try {
      if (!newRoute.path || !newRoute.serviceId) return toast.error('Vui lòng nhập đường dẫn và chọn Service');
      await gatewayApi.createRoute({
        ...newRoute,
        serviceId: Number(newRoute.serviceId)
      });
      toast.success('Đã thêm Route mới');
      setNewRoute({ path: '', serviceId: '', methods: 'GET,POST,PUT,DELETE,PATCH', stripPath: true });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi thêm Route');
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa route này?')) return;
    try {
      await gatewayApi.deleteRoute(id);
      toast.success('Đã xóa Route');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleCreateApiKey = async () => {
    try {
      if (!newApiKey.name) return toast.error('Vui lòng nhập tên ứng dụng');
      const res = await gatewayApi.createApiKey(newApiKey);
      toast.success(`Đã tạo API Key thành công! Key: ${res.key}`);
      setNewApiKey({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi tạo API Key');
    }
  };

  const handleDeleteApiKey = async (id: number) => {
    if (!confirm('Bạn có chắc muốn thu hồi (xóa) khóa này? Khách hàng sẽ bị chặn truy cập lập tức!')) return;
    try {
      await gatewayApi.deleteApiKey(id);
      toast.success('Đã thu hồi API Key');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi thu hồi');
    }
  };

  const toggleApiKeyStatus = async (key: ApiKey, isActive: boolean) => {
    try {
      await gatewayApi.updateApiKey(key.id, { isActive });
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };


  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Cổng giao tiếp (Gateway)</h1>
        <p className="text-muted-foreground">
          Định tuyến các API từ bên ngoài vào hệ thống Microservices nội bộ một cách an toàn.
        </p>
      </div>

      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="services" className="flex gap-2"><Network className="w-4 h-4"/> Services</TabsTrigger>
          <TabsTrigger value="routes" className="flex gap-2"><RouteIcon className="w-4 h-4"/> Routes</TabsTrigger>
          <TabsTrigger value="apikeys" className="flex gap-2"><Key className="w-4 h-4"/> API Keys</TabsTrigger>
        </TabsList>

        {/* SERVICES */}
        <TabsContent value="services" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Thêm Microservice (Upstream)</CardTitle>
              <CardDescription>Đăng ký địa chỉ các Microservice nội bộ để Gateway có thể forward request tới.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label>Tên Dịch vụ</Label>
                <Input placeholder="user-service" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ URL nội bộ</Label>
                <Input placeholder="http://user-service:50051" value={newService.url} onChange={e => setNewService({...newService, url: e.target.value})} />
              </div>
              <Button onClick={handleCreateService}><Plus className="w-4 h-4 mr-2" /> Thêm Service</Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map(s => (
              <Card key={s.id} className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteService(s.id)} className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="font-mono text-xs text-blue-600 bg-blue-50 p-1.5 rounded">{s.url}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ROUTES */}
        <TabsContent value="routes" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Thêm Route định tuyến</CardTitle>
              <CardDescription>Cấu hình đường dẫn URL bên ngoài ánh xạ tới Service nội bộ.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Label>Đường dẫn (Path)</Label>
                <Input placeholder="/api/v1/external/users/*" value={newRoute.path} onChange={e => setNewRoute({...newRoute, path: e.target.value})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chuyển tiếp đến</Label>
                <Select value={newRoute.serviceId} onValueChange={v => setNewRoute({...newRoute, serviceId: v})}>
                  <SelectTrigger><SelectValue placeholder="Chọn Service" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>Cắt tiền tố (Strip)</Label>
                <div className="h-10 flex items-center">
                  <Switch checked={newRoute.stripPath} onCheckedChange={v => setNewRoute({...newRoute, stripPath: v})} />
                </div>
              </div>
              <Button onClick={handleCreateRoute} className="w-full md:col-span-1"><Plus className="w-4 h-4 mr-2" /> Thêm</Button>
            </CardContent>
          </Card>

          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Đường dẫn bên ngoài (Path)</th>
                  <th className="px-6 py-4">Chuyển tiếp đến (Target)</th>
                  <th className="px-6 py-4">Phương thức</th>
                  <th className="px-6 py-4">Strip Path</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{r.path}</td>
                    <td className="px-6 py-4"><span className="inline-flex px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{r.service?.name || `Service ID: ${r.serviceId}`}</span></td>
                    <td className="px-6 py-4 text-xs text-slate-500">{r.methods}</td>
                    <td className="px-6 py-4">{r.stripPath ? '✅' : '❌'}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRoute(r.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {routes.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">Chưa có cấu hình route nào</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* API KEYS */}
        <TabsContent value="apikeys" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle>Cấp phát API Key</CardTitle>
              <CardDescription>Tạo khóa bí mật cho các hệ thống bên thứ 3 (LGSP, Hành chính công, ...) gọi vào Gateway.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Label>Tên ứng dụng / Đơn vị</Label>
                <Input placeholder="Cổng DVC Quốc gia" value={newApiKey.name} onChange={e => setNewApiKey({...newApiKey, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Input placeholder="Dùng để đồng bộ hồ sơ..." value={newApiKey.description} onChange={e => setNewApiKey({...newApiKey, description: e.target.value})} />
              </div>
              <Button onClick={handleCreateApiKey}><Plus className="w-4 h-4 mr-2" /> Tạo Key</Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {apiKeys.map(k => (
              <Card key={k.id} className="relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${k.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{k.name}</CardTitle>
                      <CardDescription className="mt-1">{k.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={k.isActive} onCheckedChange={(v) => toggleApiKeyStatus(k, v)} />
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteApiKey(k.id)} className="h-8 w-8 text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-sm break-all">
                    {k.key}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Truyền khóa này vào header <code className="bg-slate-100 px-1 py-0.5 rounded">x-api-key</code> khi gọi API.</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
