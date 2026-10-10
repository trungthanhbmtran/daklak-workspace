/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Plus, Trash2, Loader2, MoreHorizontal, Settings, HeartPulse, Clock, Save } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ─── ServiceConfigDialog — Advanced Settings for Upstream ─────────────────
function ServiceConfigDialog({ service, isOpen, onOpenChange }: { service: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    healthCheckPath: "/health",
    healthCheckInterval: 30000,
    connectTimeout: 5000,
    readTimeout: 30000
  });

  React.useEffect(() => {
    if (service) {
      setConfig({
        healthCheckPath: service.healthCheckPath || "/health",
        healthCheckInterval: service.healthCheckInterval || 30000,
        connectTimeout: service.connectTimeout || 5000,
        readTimeout: service.readTimeout || 30000
      });
    }
  }, [service]);

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: any) => gatewayApi.updateService(service.id, data),
    onSuccess: () => {
      toast.success(`Đã lưu cấu hình chuyên sâu cho upstream: ${service?.name}`);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["gateway", "services"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi lưu thiết lập");
    }
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Cấu hình chuyên sâu Service</DialogTitle>
          <DialogDescription className="font-mono text-xs mt-1">
            {service.name} ({service.url})
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="health" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health"><HeartPulse className="w-4 h-4 mr-2" /> Health Check</TabsTrigger>
            <TabsTrigger value="timeout"><Clock className="w-4 h-4 mr-2" /> Timeout & Kết nối</TabsTrigger>
          </TabsList>
          
          <TabsContent value="health" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Đường dẫn kiểm tra (Health Path)</Label>
              <Input value={config.healthCheckPath} onChange={e => setConfig({...config, healthCheckPath: e.target.value})} />
              <p className="text-[10px] text-muted-foreground">Gateway sẽ ping vào đường dẫn này để biết Service còn sống hay không.</p>
            </div>
            <div className="space-y-2">
              <Label>Chu kỳ kiểm tra (ms)</Label>
              <Input type="number" value={config.healthCheckInterval} onChange={e => setConfig({...config, healthCheckInterval: Number(e.target.value)})} />
            </div>
          </TabsContent>
          
          <TabsContent value="timeout" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Connect Timeout (ms)</Label>
              <Input type="number" value={config.connectTimeout} onChange={e => setConfig({...config, connectTimeout: Number(e.target.value)})} />
              <p className="text-[10px] text-muted-foreground">Thời gian chờ tối đa để thiết lập TCP connection với upstream.</p>
            </div>
            <div className="space-y-2">
              <Label>Read Timeout (ms)</Label>
              <Input type="number" value={config.readTimeout} onChange={e => setConfig({...config, readTimeout: Number(e.target.value)})} />
              <p className="text-[10px] text-muted-foreground">Thời gian chờ tối đa để upstream xử lý và trả về data.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Lưu thiết lập
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ServicesTab() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [configServiceId, setConfigServiceId] = useState<number | null>(null);
  const [newService, setNewService] = useState({ 
    name: '', 
    url: '', 
    description: '',
    loadBalanceStrategy: 'ROUND_ROBIN',
    useSsl: false,
    ignoreTlsVerify: true
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['gateway', 'services'],
    queryFn: gatewayApi.getServices
  });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createService,
    onSuccess: () => {
      toast.success('Đã thêm Service mới');
      setNewService({ 
        name: '', url: '', description: '', loadBalanceStrategy: 'ROUND_ROBIN', useSsl: false, ignoreTlsVerify: true
      });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ['gateway', 'services'] });
    },
    onError: () => toast.error('Lỗi khi thêm Service')
  });

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteService,
    onSuccess: () => {
      toast.success('Đã xóa Service');
      queryClient.invalidateQueries({ queryKey: ['gateway', 'services'] });
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

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Services (Upstreams)</h2>
          <p className="text-sm text-muted-foreground mt-1">Quản lý các dịch vụ đích (backend) mà Gateway sẽ định tuyến đến.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Thêm Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Network className="w-5 h-5 text-primary" /> Thêm mới Service Upstream</DialogTitle>
              <DialogDescription>
                Đăng ký địa chỉ của Microservice nội bộ hoặc bên thứ 3.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Mã Service (Name)</Label>
                <Input placeholder="e.g. user-service" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Địa chỉ URL (cách nhau bởi dấu phẩy nếu nhiều nodes)</Label>
                <Input placeholder="e.g. http://user-service:50051" className="font-mono" value={newService.url} onChange={e => setNewService({ ...newService, url: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Chiến lược Load Balancing</Label>
                <Select value={newService.loadBalanceStrategy} onValueChange={(val) => setNewService({ ...newService, loadBalanceStrategy: val })}>
                  <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
                    <SelectItem value="RANDOM">Random</SelectItem>
                    <SelectItem value="NONE">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3 mt-2 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Checkbox id="useSsl" checked={newService.useSsl} onCheckedChange={(checked) => setNewService({ ...newService, useSsl: !!checked })} />
                  <Label htmlFor="useSsl" className="cursor-pointer">Dùng SSL (HTTPS) cho Upstream này</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="ignoreTlsVerify" checked={newService.ignoreTlsVerify} onCheckedChange={(checked) => setNewService({ ...newService, ignoreTlsVerify: !!checked })} />
                  <Label htmlFor="ignoreTlsVerify" className="cursor-pointer">Bỏ qua lỗi chứng chỉ (Insecure / Self-signed)</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0 bg-card border border-border shadow-sm rounded-lg overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            <TableRow>
              <TableHead className="w-[200px] px-6 py-4 text-xs font-semibold uppercase tracking-wider">Service Name</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Target URL</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Cấu hình</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Routes</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[200px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[50px] mx-auto" /></TableCell>
                  <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Network className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium text-lg text-foreground">Không có Service nào</p>
                    <p className="text-sm mt-1">Bấm "Thêm Service" để bắt đầu thiết lập Gateway.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map(s => (
                <TableRow key={s.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <Network className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[11px] leading-relaxed text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border break-all whitespace-pre-wrap" title={s.url}>
                        {s.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold text-muted-foreground">{s.loadBalanceStrategy || 'ROUND_ROBIN'}</Badge>
                      {s.useSsl && <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-transparent">SSL</Badge>}
                      {s.ignoreTlsVerify && <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-transparent">INSECURE</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 font-bold border-transparent">
                      {(s as any).routes?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setConfigServiceId(s.id)}>
                          <Settings className="w-4 h-4 mr-2" /> Cấu hình Service
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(s.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Xóa Service
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ServiceConfigDialog 
        service={services.find((s: any) => s.id === configServiceId)} 
        isOpen={!!configServiceId} 
        onOpenChange={(open) => !open && setConfigServiceId(null)} 
      />
    </div>
  );
}
