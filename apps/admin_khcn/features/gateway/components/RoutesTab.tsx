"use client";

import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Route as RouteIcon, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";

// ─── RouteRow — memoized, handles own delete mutation ────────────────────────

interface RouteRowProps {
  r: any;
}

const RouteRow = React.memo(function RouteRow({ r }: RouteRowProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: gatewayApi.deleteRoute,
    onSuccess: () => {
      toast.success("Đã xóa Route");
      queryClient.invalidateQueries({ queryKey: ["gateway", "routes"] });
    },
    onError: () => toast.error("Lỗi khi xóa"),
  });

  const handleDelete = useCallback(() => {
    if (!confirm("Bạn có chắc muốn xóa route này?")) return;
    deleteMutation.mutate(r.id);
  }, [r.id, deleteMutation]);

  return (
    <TableRow className="hover:bg-muted/30 transition-colors group">
      <TableCell className="px-6 py-4 font-mono font-medium text-primary">{r.path}</TableCell>
      <TableCell className="px-6 py-4">
        <Badge variant="secondary" className="bg-muted border-transparent text-foreground hover:bg-muted/80 rounded-md font-medium px-2.5 py-1">
          {r.service?.name || `ID:${r.serviceId}`}
        </Badge>
      </TableCell>
      <TableCell className="px-6 py-4">
        <div className="flex gap-1.5 flex-wrap max-w-xs">
          {r.methods.split(",").map((m: string) => (
            <span
              key={m}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-muted text-muted-foreground"
            >
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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {deleteMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-1.5" />
          )}
          Xóa
        </Button>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function RoutesTab() {
  const queryClient = useQueryClient();
  const [newRoute, setNewRoute] = useState({
    path: "",
    serviceId: "",
    methods: "GET,POST,PUT,DELETE,PATCH",
    stripPath: true,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["gateway", "services"],
    queryFn: gatewayApi.getServices,
  });

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["gateway", "routes"],
    queryFn: gatewayApi.getRoutes,
  });

  const createMutation = useMutation({
    mutationFn: gatewayApi.createRoute,
    onSuccess: () => {
      toast.success("Đã thêm Route mới");
      setNewRoute({ path: "", serviceId: "", methods: "GET,POST,PUT,DELETE,PATCH", stripPath: true });
      queryClient.invalidateQueries({ queryKey: ["gateway", "routes"] });
    },
    onError: () => toast.error("Lỗi khi thêm Route"),
  });

  const handleCreate = useCallback(() => {
    if (!newRoute.path || !newRoute.serviceId)
      return toast.error("Vui lòng nhập đường dẫn và chọn Service");
    createMutation.mutate({ ...newRoute, serviceId: Number(newRoute.serviceId) });
  }, [newRoute, createMutation]);

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden pb-4">
      {/* Create form */}
      <Card className="shrink-0 border-none shadow-sm rounded-md overflow-hidden bg-card border border-border">
        <CardHeader className="bg-muted/30 border-b border-border pb-6">
          <CardTitle className="flex items-center gap-2 text-xl">
            <RouteIcon className="w-5 h-5 text-primary" /> Đăng ký Route mới
          </CardTitle>
          <CardDescription>
            Thiết lập quy tắc ánh xạ (mapping) từ đường dẫn API ngoài vào service đích tương ứng.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
            <div className="space-y-2 md:col-span-5">
              <Label className="text-foreground">Đường dẫn Request (Path Matcher)</Label>
              <Input
                className="h-10 rounded-md bg-background border-input focus-visible:ring-primary font-mono text-sm"
                placeholder="/api/v1/external/users/*"
                value={newRoute.path}
                onChange={(e) => setNewRoute({ ...newRoute, path: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label className="text-foreground">Service đích (Target)</Label>
              <Select value={newRoute.serviceId} onValueChange={(v) => setNewRoute({ ...newRoute, serviceId: v })}>
                <SelectTrigger className="h-10 rounded-md bg-background border-input focus:ring-primary">
                  <SelectValue placeholder="Chọn Service..." />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border shadow-md">
                  {services.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()} className="cursor-pointer">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2 flex flex-col items-center">
              <Label className="text-foreground">Strip Path</Label>
              <div className="h-10 flex items-center">
                <Switch
                  checked={newRoute.stripPath}
                  onCheckedChange={(v) => setNewRoute({ ...newRoute, stripPath: v })}
                />
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="h-10 md:col-span-2 rounded-md bg-primary hover:bg-primary/90 shadow-sm text-primary-foreground w-full"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-1.5" />
              )}
              Thêm Route
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes table */}
      <div className="flex-1 flex flex-col min-h-0 bg-card border border-border shadow-sm rounded-md overflow-hidden">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted/50">
              <TableRow className="text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                <TableHead className="px-6 py-5">Đường dẫn (Path)</TableHead>
                <TableHead className="px-6 py-5">Service Target</TableHead>
                <TableHead className="px-6 py-5">Methods</TableHead>
                <TableHead className="px-6 py-5 text-center">Strip Path</TableHead>
                <TableHead className="px-6 py-5 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-16 text-center text-muted-foreground bg-muted/10">
                    <RouteIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                    Chưa có quy tắc định tuyến nào được cấu hình
                  </TableCell>
                </TableRow>
              ) : (
                // Mỗi row tự xử lý delete mutation riêng
                routes.map((r: any) => <RouteRow key={r.id} r={r} />)
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
