"use client";

import { memo, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Plus, Trash2, Loader2, Database, Component,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { resourceApi } from "../api";
import { resourceKeys } from "../keys";
import type { Resource } from "../types";

// ─── Constants ────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const DEFAULT_SERVICE_LIST_FALLBACK = [
  { code: "CORE_SERVICE", name: "Core Service (Tổng quan, Cấu hình)" },
  { code: "USER_SERVICE", name: "User Service (Xác thực, PBAC, Menu)" },
  { code: "CONTENT_SERVICE", name: "Content Service (Nội dung Cổng)" },
  { code: "HRM_SERVICE", name: "HRM Service (Nhân sự)" },
  { code: "NOTIFICATION_SERVICE", name: "Notification Service (Thông báo)" },
  { code: "DOCUMENT_SERVICE", name: "Document Service (Văn bản)" },
  { code: "POSTS_SERVICE", name: "Posts Service (Bài viết, Tin tức)" },
  { code: "WORKFLOW_SERVICE", name: "Workflow Service (Quy trình, Công việc)" },
  { code: "API_GATEWAY", name: "API Gateway" },
];

// ─── Component ────────────────────────────────────────────────────────
function ResourceSidebarInner() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // ── State riêng cho form thêm mới ──
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newServiceCode, setNewServiceCode] = useState("USER_SERVICE");
  const [page, setPage] = useState(1);

  // ── React Query riêng cho sidebar ──
  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: () => resourceApi.getResources(),
    staleTime: 3 * 60 * 1000,
  });

  // ── Derived data ──
  const filteredResources = useMemo(
    () =>
      resources.filter(
        (r: Resource) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.code.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [resources, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredResources.length / PAGE_SIZE));
  const pagedResources = useMemo(() => {
    const safePage = page > totalPages ? 1 : page;
    return filteredResources.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  }, [filteredResources, page, totalPages]);

  // ── Mutations riêng cho sidebar ──
  const invalidateResources = () =>
    queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });

  const createResourceMutation = useMutation({
    mutationFn: (payload: { code: string; name: string; serviceCode?: string }) =>
      resourceApi.createResource(payload),
    onSuccess: () => invalidateResources(),
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (id: number) => resourceApi.deleteResource(id),
    onSuccess: () => invalidateResources(),
  });

  // ── Handlers ──
  const handleCreateResource = () => {
    const code = newCode.trim();
    const name = newName.trim();
    if (!code || !name) return;
    createResourceMutation.mutate(
      { code, name, serviceCode: newServiceCode },
      { onSuccess: () => { setNewCode(""); setNewName(""); } }
    );
  };

  // Lấy selectedId từ URL: /services/admin/resources/123 → "123"
  const selectedId = useMemo(() => {
    const match = pathname.match(/\/resources\/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [pathname]);

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">Đang tải danh sách tài nguyên...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 max-w-md border-destructive/50">
          <p className="text-destructive font-medium text-center">Không thể tải dữ liệu từ máy chủ.</p>
          <p className="text-sm text-muted-foreground mt-2 text-center">Vui lòng kiểm tra kết nối và thử lại.</p>
        </Card>
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-full shadow-sm border-border overflow-hidden">
      {/* Header + Search */}
      <div className="p-4 space-y-4 border-b bg-muted/20 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> Quản lý Module / Tài nguyên
          </h3>
          <Badge variant="secondary" className="font-mono">{resources.length}</Badge>
        </div>
        <Search placeholder="Tìm theo tên hoặc mã..." className="w-full h-9" />
      </div>

      {/* Form thêm tài nguyên */}
      <div className="p-4 border-b bg-background shrink-0 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thêm mới</p>
        <Select value={newServiceCode} onValueChange={setNewServiceCode}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Chọn Dịch vụ" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_SERVICE_LIST_FALLBACK.map((s) => (
              <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Input placeholder="Mã (code)" className="h-9 text-sm font-mono flex-1" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <Input placeholder="Tên hiển thị" className="h-9 text-sm flex-1" value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <Button size="sm" className="w-full h-9" onClick={handleCreateResource} disabled={createResourceMutation.isPending || !newCode.trim() || !newName.trim()}>
          {createResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Thêm tài nguyên</>}
        </Button>
        {createResourceMutation.isError && (
          <p className="text-xs text-destructive text-center">
            {String((createResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi tạo tài nguyên")}
          </p>
        )}
      </div>

      {/* Danh sách resource — scroll được */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin bg-muted/5">
        {pagedResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Component className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground italic">Không tìm thấy tài nguyên nào.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(
              pagedResources.reduce((acc: Record<string, Resource[]>, res: Resource) => {
                const svc = res.serviceCode || "OTHER";
                if (!acc[svc]) acc[svc] = [];
                acc[svc].push(res);
                return acc;
              }, {} as Record<string, Resource[]>)
            ).map(([svc, group]) => (
              <div key={svc} className="space-y-2">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  {DEFAULT_SERVICE_LIST_FALLBACK.find((s) => s.code === svc)?.name || svc}
                  <div className="h-px bg-border flex-1" />
                </div>
                <div className="grid gap-1">
                  {group.map((res) => {
                    const isSelected = selectedId === res.id;
                    return (
                      <Link
                        key={res.id}
                        href={`/services/admin/resources/${res.id}`}
                        className={`group flex items-center justify-between p-2.5 rounded-lg transition-all border ${
                          isSelected
                            ? "bg-primary/10 border-primary/20 cursor-default"
                            : "bg-background border-transparent hover:bg-accent hover:border-border cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`p-1.5 rounded-md ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-background"}`}>
                            <Component className="h-4 w-4 shrink-0" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? "text-primary" : "text-foreground"}`}>{res.name}</p>
                            <p className="text-[11px] font-mono truncate text-muted-foreground">{res.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {isSelected ? (
                            <div className="h-4 w-4 text-primary opacity-70">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteResourceMutation.mutate(res.id); }}
                              disabled={deleteResourceMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phân trang */}
      {filteredResources.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 shrink-0">
          <span className="text-xs text-muted-foreground font-medium">
            {(page - 1) * PAGE_SIZE + 1} – {Math.min(page * PAGE_SIZE, filteredResources.length)} / {filteredResources.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export const ResourceSidebar = memo(ResourceSidebarInner);
