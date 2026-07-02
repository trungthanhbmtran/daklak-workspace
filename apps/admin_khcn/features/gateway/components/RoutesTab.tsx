"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Route as RouteIcon, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";

export function RoutesTab() {
  const queryClient = useQueryClient();
  const [newRoute, setNewRoute] = useState({ path: '', serviceId: '', methods: 'GET,POST,PUT,DELETE,PATCH', stripPath: true });

  const { data: services = [] } = useQuery({
    queryKey: ['gateway', 'services'],
    queryFn: gatewayApi.getServices
  });

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['gateway', 'routes'],
    queryFn: gatewayApi.getRoutes
  });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createRoute,
    onSuccess: () => {
      toast.success('Đã thêm Route mới');
      setNewRoute({ path: '', serviceId: '', methods: 'GET,POST,PUT,DELETE,PATCH', stripPath: true });
      queryClient.invalidateQueries({ queryKey: ['gateway', 'routes'] });
    },
    onError: () => toast.error('Lỗi khi thêm Route')
  });

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteRoute,
    onSuccess: () => {
      toast.success('Đã xóa Route');
      queryClient.invalidateQueries({ queryKey: ['gateway', 'routes'] });
    },
    onError: () => toast.error('Lỗi khi xóa')
  });

  const handleCreate = () => {
    if (!newRoute.path || !newRoute.serviceId) return toast.error('Vui lòng nhập đường dẫn và chọn Service');
    createMutation.mutate({
      ...newRoute,
      serviceId: Number(newRoute.serviceId)
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa route này?')) return;
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="border-none shadow-sm rounded-md overflow-hidden bg-white border border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <RouteIcon className="w-5 h-5 text-indigo-500" /> Đăng ký Route mới
          </CardTitle>
          <CardDescription>
            Thiết lập quy tắc ánh xạ (mapping) từ đường dẫn API ngoài vào service đích tương ứng.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="space-y-2 md:col-span-5">
              <Label className="text-slate-600">Đường dẫn Request (Path Matcher)</Label>
              <Input className="h-10 rounded-md bg-white border-slate-200 focus-visible:ring-indigo-500 font-mono text-sm" placeholder="/api/v1/external/users/*" value={newRoute.path} onChange={e => setNewRoute({...newRoute, path: e.target.value})} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label className="text-slate-600">Service đích (Target)</Label>
              <Select value={newRoute.serviceId} onValueChange={v => setNewRoute({...newRoute, serviceId: v})}>
                <SelectTrigger className="h-10 rounded-md bg-white border-slate-200 focus:ring-indigo-500">
                  <SelectValue placeholder="Chọn Service..." />
                </SelectTrigger>
                <SelectContent className="rounded-md border-slate-100 shadow-md">
                  {services.map(s => <SelectItem key={s.id} value={s.id.toString()} className="cursor-pointer">{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2 flex flex-col items-center">
              <Label className="text-slate-600">Strip Path</Label>
              <div className="h-10 flex items-center">
                <Switch checked={newRoute.stripPath} onCheckedChange={v => setNewRoute({...newRoute, stripPath: v})} />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-10 md:col-span-2 rounded-md bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white w-full">
              {createMutation.isPending ? <Loader2 className="w-5 h-5 mr-1.5 animate-spin" /> : <Plus className="w-5 h-5 mr-1.5" />} 
              Thêm Route
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Đường dẫn (Path)</th>
                <th className="px-6 py-5">Service Target</th>
                <th className="px-6 py-5">Methods</th>
                <th className="px-6 py-5 text-center">Strip Path</th>
                <th className="px-6 py-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {routes.map(r => (
                <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-700">{r.path}</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-medium px-2.5 py-1">
                      {r.service?.name || `ID:${r.serviceId}`}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap max-w-xs">
                      {r.methods.split(',').map(m => (
                        <span key={m} className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-100 text-slate-500">
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.stripPath ? (
                      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-slate-300 font-bold">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} disabled={deleteMutation.isPending} className="h-8 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1.5" />} Xóa
                    </Button>
                  </td>
                </tr>
              ))}
              {routes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 bg-slate-50/30">
                    <RouteIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    Chưa có quy tắc định tuyến nào được cấu hình
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
