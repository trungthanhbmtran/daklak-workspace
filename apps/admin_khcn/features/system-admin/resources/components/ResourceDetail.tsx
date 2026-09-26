/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { memo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Component } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";

import { resourceApi } from "../api";
import { resourceKeys } from "../keys";
import type { Resource } from "../types";
import { toast } from "sonner";

// ─── Props ────────────────────────────────────────────────────────────
interface ResourceDetailProps {
  resourceId: number;
}

// ─── Component ────────────────────────────────────────────────────────
function ResourceDetailInner({ resourceId }: ResourceDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── React Query riêng: đọc từ cache list rồi find theo id ──
  const { data: resource, isLoading, isError } = useQuery({
    queryKey: [...resourceKeys.all, "detail", resourceId],
    queryFn: async () => {
      // Thử lấy từ cache list trước
      const cached = queryClient.getQueryData<Resource[]>(resourceKeys.lists());
      const found = cached?.find((r) => r.id === resourceId);
      if (found) return found;

      // Nếu chưa có cache, fetch lại list và tìm
      const list = await resourceApi.getResources();
      queryClient.setQueryData(resourceKeys.lists(), list);
      return list.find((r) => r.id === resourceId) ?? null;
    },
    staleTime: 3 * 60 * 1000,
  });

  // ── State riêng cho form chỉnh sửa ──
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");

  // Sync form state khi resource thay đổi
  useEffect(() => {
    if (resource) {
      setEditName(resource.name);
      setEditCode(resource.code);
    }
  }, [resource]);

  // ── Mutation riêng cho detail ──
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    queryClient.invalidateQueries({ queryKey: [...resourceKeys.all, "detail", resourceId] });
  };

  const updateResourceMutation = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, ...payload }: { id: number; code?: string; name?: string }) =>
      resourceApi.updateResource(id, payload),
    onSuccess: (res: { data?: { id: number; code: string; name: string } }) => {
      const d = res.data;
      if (d) {
        setEditName(d.name);
        setEditCode(d.code);
      }
      invalidateAll();
    },
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <Card className="w-full h-full shadow-sm border-border flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <Text weight="medium">Đang tải chi tiết...</Text>
        </div>
      </Card>
    );
  }

  // ── Not Found ──
  if (isError || !resource) {
    return (
      <Card className="w-full h-full shadow-sm border-border flex items-center justify-center bg-muted/10 border-dashed rounded-xl">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="h-16 w-16 bg-background border rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Component className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <Heading level="h3" className="mb-1">Không tìm thấy tài nguyên</Heading>
          <Text variant="muted" className="mb-4">Tài nguyên này không tồn tại hoặc đã bị xóa.</Text>
          <Button variant="outline" onClick={() => router.push("/services/admin/resources")}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1 w-full min-h-0 shadow-sm border-border overflow-hidden flex flex-col rounded-xl bg-background">
      {/* HEADER */}
      <div className="bg-muted/40 border-b py-4 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent text-accent-foreground border">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold leading-none">
              Thiết lập: {resource.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <Text variant="small" className="text-muted-foreground uppercase tracking-tight">Mã hệ thống:</Text>
              <Badge variant="outline" className="text-[9px] h-4 font-mono uppercase bg-background border-primary/50 text-primary">
                {resource.code}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="flex-1 p-0 overflow-y-auto scrollbar-thin">
        {/* 1. THÔNG TIN ĐỊNH DANH */}
        <div className="p-6 space-y-5">
          <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Thông tin tài nguyên
          </Text>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            <div className="grid gap-2">
              <Text as="label" weight="medium" className="text-[10px] font-bold uppercase text-muted-foreground">Tên hiển thị *</Text>
              <Input
                className="h-9 text-sm focus-visible:ring-1"
                placeholder="VD: Quản lý người dùng"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Text as="label" weight="medium" className="text-[10px] font-bold uppercase text-muted-foreground">Mã hệ thống (Code) *</Text>
              <Input
                className="h-9 font-mono text-sm uppercase"
                placeholder="VD: USERS_MANAGE"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
              />
            </div>
          </div>
          
          {updateResourceMutation.isError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-2 max-w-3xl">
              <Text variant="error" weight="medium">
                {String(
                  (updateResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? "Có lỗi xảy ra khi cập nhật tài nguyên."
                )}
              </Text>
            </div>
          )}
        </div>
      </CardContent>

      {/* FOOTER */}
      <div className="p-4 border-t bg-muted/20 shrink-0 flex justify-end gap-3 items-center">
        <Button
          onClick={() =>
            updateResourceMutation.mutate({
              id: resource.id,
              code: editCode,
              name: editName,
            })
          }
          disabled={updateResourceMutation.isPending}
          className="px-10 text-xs font-bold h-9 shadow-sm"
        >
          {updateResourceMutation.isPending ? "Đang xử lý..." : "Lưu Tài nguyên"}
        </Button>
      </div>
    </Card>
  );
}

export const ResourceDetail = memo(ResourceDetailInner);
