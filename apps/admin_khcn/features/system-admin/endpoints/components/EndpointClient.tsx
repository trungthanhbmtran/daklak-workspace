"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "lucide-react";
import { toast } from "sonner";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { endpointApi } from "../api";
import apiClient from "@/lib/axiosInstance";

// ─── EndpointRow — tự quản lý assignMutation riêng ───────────────────────────

interface EndpointRowProps {
  ep: any;
  permissions: { id: number; label: string; group: string }[];
}

const EndpointRow = React.memo(function EndpointRow({ ep, permissions }: EndpointRowProps) {
  const queryClient = useQueryClient();

  const assignMutation = useMutation({
    mutationFn: ({ endpointId, permissionId }: { endpointId: number; permissionId: number }) =>
      endpointApi.assignPermission(endpointId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      toast.success("Cập nhật quyền thành công");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật"),
  });

  const handleChange = useCallback(
    (val: string) => assignMutation.mutate({ endpointId: ep.id, permissionId: Number(val) }),
    [ep.id, assignMutation],
  );

  const methodVariant = ep.method === "GET" ? "secondary" : "default";

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="px-4 py-3">
        <Badge variant={methodVariant} className="font-mono">{ep.method}</Badge>
      </TableCell>
      <TableCell className="px-4 py-3 font-mono text-sm">{ep.path}</TableCell>
      <TableCell className="px-4 py-3">
        <Select
          value={ep.permission_id ? String(ep.permission_id) : "0"}
          onValueChange={handleChange}
          disabled={assignMutation.isPending}
        >
          <SelectTrigger className="w-[300px] h-8">
            <SelectValue placeholder="Không yêu cầu quyền (Public)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <span className="text-muted-foreground italic">-- Không yêu cầu quyền (Public) --</span>
            </SelectItem>
            {permissions.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                <span className="font-mono text-xs">{p.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
});

// ─── Root ─────────────────────────────────────────────────────────────────────

export function EndpointClient() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: endpointsData, isLoading: isEndpointsLoading } = useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const res = await endpointApi.getEndpoints();
      return (res as any)?.data?.endpoints || (res as any)?.endpoints || [];
    },
    staleTime: 5 * 60_000,
  });

  const { data: permissionsData, isLoading: isPermissionsLoading } = useQuery({
    queryKey: ["roles", "permissions", "matrix"],
    queryFn: async () => {
      const res = await apiClient.get("/roles/permissions/matrix");
      const list = (res as any)?.data?.resources || (res as any)?.resources || [];
      const out: any[] = [];
      list.forEach((r: any) => {
        (r.permissions || []).forEach((p: any) => {
          out.push({ id: p.id, label: r.code + ":" + p.action, group: r.name });
        });
      });
      return out;
    },
    staleTime: 5 * 60_000,
  });

  const endpoints = endpointsData || [];
  const permissions = permissionsData || [];

  const filtered = useMemo(
    () =>
      endpoints.filter(
        (e: any) =>
          e.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.method.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [endpoints, searchTerm],
  );

  const isLoading = isEndpointsLoading || isPermissionsLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" /> Dynamic API Policy
          </CardTitle>
          <CardDescription>
            Phân quyền truy cập động cho các API Endpoint. Không cần khởi động lại hệ thống.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Tìm kiếm path (vd: /admin/users)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="border rounded-md overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="px-4 py-3 text-xs uppercase text-muted-foreground">Method</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase text-muted-foreground">Path</TableHead>
                    <TableHead className="px-4 py-3 text-xs uppercase text-muted-foreground">Require Permission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell className="px-4 py-3"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="px-4 py-3"><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="px-4 py-3"><Skeleton className="h-8 w-[300px]" /></TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                        Không tìm thấy Endpoint nào. Thử F5 hoặc khởi động lại Gateway để tự động quét.
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Mỗi row tự xử lý mutation → không lan sang rows khác
                    filtered.map((ep: any) => (
                      <EndpointRow key={ep.id} ep={ep} permissions={permissions} />
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
