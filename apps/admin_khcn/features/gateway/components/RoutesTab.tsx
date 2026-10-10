/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Route as RouteIcon, Plus, Trash2, CheckCircle2, Loader2, MoreHorizontal, Settings, ArrowRight, Shield, Zap, Save } from "lucide-react";

// ─── RouteConfigDialog — Advanced Settings for Route ──────────────────────────
function RouteConfigDialog({ route, isOpen, onOpenChange }: { route: any, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    rateLimit: 100,
    cacheTtl: 0,
    timeout: 30000,
    corsEnabled: true
  });

  React.useEffect(() => {
    if (route) {
      setConfig({
        rateLimit: route.rateLimit || 100,
        cacheTtl: route.cacheTtl || 0,
        timeout: route.timeout || 30000,
        corsEnabled: route.corsEnabled ?? true
      });
    }
  }, [route]);

  if (!route) return null;

  const queryClient = useQueryClient();
  const updateMutation = useMutation({
    mutationFn: (data: any) => gatewayApi.updateRoute(route.id, data),
    onSuccess: () => {
      toast.success("Đã lưu cấu hình chuyên sâu cho Route");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["gateway", "routes"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi lưu thiết lập");
    }
  });

  const handleSave = () => {
    updateMutation.mutate(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Cấu hình chuyên sâu Route</DialogTitle>
          <DialogDescription className="font-mono text-xs mt-1">
            {route.path}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="security" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Bảo mật & Giới hạn</TabsTrigger>
            <TabsTrigger value="performance"><Zap className="w-4 h-4 mr-2" /> Hiệu suất</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Rate Limit (Req / phút)</Label>
              <Input type="number" value={config.rateLimit} onChange={e => setConfig({...config, rateLimit: Number(e.target.value)})} />
              <p className="text-[10px] text-muted-foreground">Giới hạn số lượng request từ một IP tới route này.</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label>Bật CORS</Label>
                <p className="text-[10px] text-muted-foreground">Cho phép gọi API từ Web Browser khác domain.</p>
              </div>
              <Switch checked={config.corsEnabled} onCheckedChange={v => setConfig({...config, corsEnabled: v})} />
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Cache TTL (giây)</Label>
              <Input type="number" value={config.cacheTtl} onChange={e => setConfig({...config, cacheTtl: Number(e.target.value)})} />
              <p className="text-[10px] text-muted-foreground">Để 0 nếu không muốn cache kết quả GET từ route này.</p>
            </div>
            <div className="space-y-2">
              <Label>Route Timeout (ms)</Label>
              <Input type="number" value={config.timeout} onChange={e => setConfig({...config, timeout: Number(e.target.value)})} />
              <p className="text-[10px] text-muted-foreground">Ghi đè Timeout toàn cục của Gateway.</p>
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

// ─── RouteRow — memoized, handles own delete mutation ────────────────────────
const RouteRow = React.memo(function RouteRow({ r, services, onConfig }: { r: any, services: any[], onConfig: (r: any) => void }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteRoute,
    onSuccess: () => {
      toast.success("Đã xóa Route");
      queryClient.invalidateQueries({ queryKey: ["gateway", "routes"] });
      queryClient.invalidateQueries({ queryKey: ["gateway", "services"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi xóa";
      toast.error(message);
    },
  });

  const handleDelete = useCallback(() => {
    if (!confirm("Bạn có chắc muốn xóa route này? Các request tương ứng sẽ bị từ chối.")) return;
    deleteMutation.mutate(r.id);
  }, [r.id, deleteMutation]);

  const service = services.find((s: any) => s.id === r.serviceId) || r.service;

  const getMethodColor = (m: string) => {
    switch (m.trim().toUpperCase()) {
      case 'GET': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'POST': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'PATCH': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">
      <TableCell className="px-6 py-4">
        <div className="font-mono text-sm font-semibold text-foreground/90">
          {r.path.startsWith('/api/v1') ? (
            <><span className="text-muted-foreground/50 font-medium">/api/v1</span>{r.path.slice(7)}</>
          ) : r.path}
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <Badge variant="outline" className="bg-background hover:bg-muted font-medium px-2 py-0.5 rounded-md w-fit">
            {service?.name || `Unknown (ID:${r.serviceId})`}
          </Badge>
          <div className="flex items-start gap-1 min-w-0">
            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-[10px] leading-relaxed text-muted-foreground font-mono break-all whitespace-pre-wrap min-w-0 flex-1">{service?.url || '---'}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex gap-1.5 flex-wrap max-w-xs">
          {r.methods.split(",").map((m: string) => (
            <span key={m} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase border ${getMethodColor(m)}`}>
              {m.trim()}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell className="px-6 py-4 text-center">
        {r.stripPath ? (
          <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : (
          <span className="text-muted-foreground/30 font-bold">-</span>
        )}
      </TableCell>
      <TableCell className="px-6 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem className="cursor-pointer" onClick={() => onConfig(r)}>
              <Settings className="w-4 h-4 mr-2" /> Cấu hình Route
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Xóa Route
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────
export function RoutesTab() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [configRoute, setConfigRoute] = useState<any>(null);
  const [newRoute, setNewRoute] = useState({
    path: "",
    serviceId: "",
    methods: "GET,POST,PUT,DELETE,PATCH",
    stripPath: true,
  });

  const { data: services = [] } = useQuery({ queryKey: ["gateway", "services"], queryFn: gatewayApi.getServices });
  const { data: routes = [], isLoading } = useQuery({ queryKey: ["gateway", "routes"], queryFn: gatewayApi.getRoutes });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createRoute,
    onSuccess: () => {
      toast.success("Đã thêm Route mới");
      setNewRoute({ path: "", serviceId: "", methods: "GET,POST,PUT,DELETE,PATCH", stripPath: true });
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["gateway", "routes"] });
      queryClient.invalidateQueries({ queryKey: ["gateway", "services"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Lỗi khi thêm Route");
    },
  });

  const handleCreate = useCallback(() => {
    if (!newRoute.path || !newRoute.serviceId) return toast.error("Vui lòng nhập đường dẫn và chọn Service");
    let finalPath = newRoute.path.trim();
    if (!finalPath.startsWith('/api/v1')) {
      finalPath = '/api/v1' + (finalPath.startsWith('/') ? finalPath : '/' + finalPath);
    }
    createMutation.mutate({ ...newRoute, path: finalPath, serviceId: Number(newRoute.serviceId) });
  }, [newRoute, createMutation]);

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">API Routes</h2>
          <p className="text-sm text-muted-foreground mt-1">Định nghĩa các quy tắc ánh xạ từ đường dẫn vào tới Service đích.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Thêm Route
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><RouteIcon className="w-5 h-5 text-primary" /> Đăng ký Route mới</DialogTitle>
              <DialogDescription>
                Thiết lập quy tắc ánh xạ (mapping matcher) cho Gateway.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Đường dẫn Request (Path Matcher)</Label>
                <div className="flex w-full">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground font-mono">/api/v1</div>
                  <Input className="font-mono text-sm rounded-l-none focus-visible:z-10" placeholder="/external/users/*" value={newRoute.path.replace(/^\/api\/v1\/?/, '/')} onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Service đích (Target)</Label>
                <Select value={newRoute.serviceId} onValueChange={(v) => setNewRoute({ ...newRoute, serviceId: v })}>
                  <SelectTrigger><SelectValue placeholder="Chọn Service..." /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {services.map((s: any) => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Methods cho phép</Label>
                <Input className="font-mono text-sm uppercase" value={newRoute.methods} onChange={(e) => setNewRoute({ ...newRoute, methods: e.target.value })} />
                <p className="text-[10px] text-muted-foreground">Ví dụ: GET,POST,PUT hoặc ALL</p>
              </div>
              <div className="flex items-center justify-between mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-0.5">
                  <Label>Strip Path (Cắt tiền tố)</Label>
                  <p className="text-[10px] text-muted-foreground">Cắt bỏ đoạn đường dẫn trùng khớp trước khi gửi tới upstream.</p>
                </div>
                <Switch checked={newRoute.stripPath} onCheckedChange={(v) => setNewRoute({ ...newRoute, stripPath: v })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Lưu Route
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 min-h-0 bg-card border border-border shadow-sm rounded-lg overflow-y-auto custom-scrollbar">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Đường dẫn (Path)</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Service Target</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Methods</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-center">Strip Path</TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[200px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[120px]" /></TableCell>
                  <TableCell className="px-6 py-4"><Skeleton className="h-5 w-[30px] mx-auto" /></TableCell>
                  <TableCell className="px-6 py-4 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <RouteIcon className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="font-medium text-lg text-foreground">Không có Route nào</p>
                    <p className="text-sm mt-1">Bấm "Thêm Route" để định tuyến luồng dữ liệu.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              routes.map((r: any) => <RouteRow key={r.id} r={r} services={services} onConfig={setConfigRoute} />)
            )}
          </TableBody>
        </Table>
      </div>

      <RouteConfigDialog 
        route={configRoute} 
        isOpen={!!configRoute} 
        onOpenChange={(open) => !open && setConfigRoute(null)} 
      />
    </div>
  );
}
