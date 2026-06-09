"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Link, Save, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { endpointApi } from "../api";
import apiClient from "@/lib/axiosInstance";

export function EndpointClient() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: endpointsData, isLoading: isEndpointsLoading } = useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const res = await endpointApi.getEndpoints();
      return (res as any)?.data?.endpoints || (res as any)?.endpoints || [];
    },
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
  });

  const assignMutation = useMutation({
    mutationFn: ({ endpointId, permissionId }: { endpointId: number; permissionId: number }) =>
      endpointApi.assignPermission(endpointId, permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      toast.success("Cập nhật quyền thành công");
    },
    onError: () => toast.error("Có lỗi xảy ra khi cập nhật"),
  });

  if (isEndpointsLoading || isPermissionsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  const endpoints = endpointsData || [];
  const permissions = permissionsData || [];

  const filtered = endpoints.filter((e: any) => 
    e.path.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link className="h-5 w-5"/> Dynamic API Policy</CardTitle>
          <CardDescription>Phân quyền truy cập động cho các API Endpoint. Không cần khởi động lại hệ thống.</CardDescription>
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

          <div className="border rounded-md">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Require Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((ep: any) => (
                  <tr key={ep.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Badge variant={ep.method === "GET" ? "secondary" : "default"} className="font-mono">{ep.method}</Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">{ep.path}</td>
                    <td className="px-4 py-3">
                      <Select 
                        value={ep.permission_id ? String(ep.permission_id) : "0"}
                        onValueChange={(val) => assignMutation.mutate({ endpointId: ep.id, permissionId: Number(val) })}
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
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                      Không tìm thấy Endpoint nào. Thử F5 hoặc khởi động lại Gateway để tự động quét.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
