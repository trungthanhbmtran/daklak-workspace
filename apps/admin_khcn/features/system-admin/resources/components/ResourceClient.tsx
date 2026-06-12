"use client";

import { useState } from "react";
import {
  KeyRound, ArrowRight, Plus, Trash2, Loader2,
  ShieldAlert, Database, Component, ChevronLeft, ChevronRight
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResourceLogic } from "../hooks/useResourceLogic";
import type { Resource } from "../types";

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

export function ResourceClient() {
  const [newCode, setNewCode] = useState("");
  const [newServiceCode, setNewServiceCode] = useState("USER_SERVICE");
  const [newName, setNewName] = useState("");

  const {
    resources: filteredResources,
    allResources,
    totalResources,
    page,
    setPage,
    totalPages,
    pageSize,
    isLoading,
    isError,
    searchTerm,
    selectedResource,
    setSelectedResource,
    createResourceMutation,
    updateResourceMutation,
    deleteResourceMutation,
  } = useResourceLogic();

  const handleCreateResource = () => {
    const code = newCode.trim();
    const name = newName.trim();
    if (!code || !name) return;
    createResourceMutation.mutate(
      { code, name, serviceCode: newServiceCode },
      {
        onSuccess: () => {
          setNewCode("");
          setNewName("");
        },
      }
    );
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">Đang tải ma trận tài nguyên...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)]">
        <Card className="p-8 max-w-md border-destructive/50">
          <p className="text-destructive font-medium">Không thể tải dữ liệu từ máy chủ.</p>
          <p className="text-sm text-muted-foreground mt-2">Kiểm tra kết nối và thử lại.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-120px)] overflow-hidden">
      {/* CỘT TRÁI: DANH SÁCH TÀI NGUYÊN */}
      <Card className="w-full lg:w-[480px] flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0 mx-auto">
        <div className="p-4 space-y-4 border-b bg-muted/40 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" /> Bảng Tài Nguyên
            </h3>
            <Badge variant="secondary" className="font-mono">{allResources.length}</Badge>
          </div>
          <Search placeholder="Tìm theo tên hoặc mã..." className="w-full" />
        </div>
        {/* Form thêm tài nguyên */}
        <div className="p-3 border-b bg-muted/20 shrink-0 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Thêm tài nguyên</p>
          <Select value={newServiceCode} onValueChange={setNewServiceCode}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Chọn Dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_SERVICE_LIST_FALLBACK.map((s) => (
                <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Mã (code)" className="h-8 text-sm font-mono" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <Input placeholder="Tên hiển thị" className="h-8 text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button size="sm" className="w-full h-8" onClick={handleCreateResource} disabled={createResourceMutation.isPending || !newCode.trim() || !newName.trim()}>
            {createResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Thêm mới</>}
          </Button>
          {createResourceMutation.isError && (
            <p className="text-xs text-destructive">{String((createResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi tạo tài nguyên")}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredResources.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground italic">Không tìm thấy tài nguyên nào.</div>
          ) : (
            <div className="space-y-4">
              {Object.entries(filteredResources.reduce((acc: Record<string, Resource[]>, res: Resource) => {
                const svc = res.serviceCode || "OTHER";
                if (!acc[svc]) acc[svc] = [];
                acc[svc].push(res);
                return acc;
              }, {} as Record<string, Resource[]>)).map(([svc, group]) => (
                <div key={svc} className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 bg-muted/30 rounded">{DEFAULT_SERVICE_LIST_FALLBACK.find(s => s.code === svc)?.name || svc}</div>
                  {group.map((res) => {
                    const isSelected = selectedResource?.id === res.id;
                    return (
                      <div
                        key={res.id}
                        className={`group flex items-center justify-between p-3 rounded-md transition-colors border border-transparent ${isSelected
                          ? "bg-primary text-primary-foreground shadow-sm cursor-default"
                          : "hover:bg-accent hover:text-accent-foreground text-foreground cursor-pointer"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1" onClick={() => setSelectedResource(res)}>
                          <Component className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{res.name}</p>
                            <p className={`text-[11px] font-mono truncate ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{res.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isSelected && <ArrowRight className="h-4 w-4 text-primary-foreground" />}
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${isSelected ? "text-primary-foreground hover:bg-primary-foreground/20" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"}`}
                            onClick={(e) => { e.stopPropagation(); deleteResourceMutation.mutate(res.id); }}
                            disabled={deleteResourceMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalResources > pageSize && (
          <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/10 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalResources)} / {totalResources}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <span className="text-[10px] font-medium px-1">{page}/{totalPages}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================== */}
      {/* CỘT PHẢI: QUẢN LÝ TÀI NGUYÊN */}
      {/* ========================================== */}
      {!selectedResource ? (
        <Card className="flex-1 w-full h-full shadow-none border-border flex items-center justify-center bg-muted/20 border-dashed  rounded-xl">
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="h-20 w-20 bg-accent rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Chưa chọn Tài nguyên</h3>
            <p className="text-sm text-muted-foreground">Vui lòng chọn một Module ở danh sách bên trái để xem và chỉnh sửa thông tin tài nguyên.</p>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 w-full h-fit shadow-sm border-border overflow-hidden flex flex-col mt-6">
          <CardHeader className="bg-muted/40 border-b px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Chỉnh sửa: {selectedResource.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm text-muted-foreground">Mã định danh hệ thống:</span>
                  <Badge variant="outline" className="font-mono bg-background text-foreground">
                    {selectedResource.code}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-8 scrollbar-thin space-y-10">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                Thông tin cơ bản
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Tên tài nguyên</span>
                  <Input
                    className="h-10 w-full max-w-md"
                    placeholder="Tên hiển thị"
                    value={selectedResource.name}
                    onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Mã hệ thống (Code)</span>
                  <Input
                    className="h-10 w-full max-w-md font-mono"
                    placeholder="Mã"
                    value={selectedResource.code}
                    onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, code: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Button
                    className="mt-4"
                    onClick={() =>
                      selectedResource &&
                      updateResourceMutation.mutate(
                        { id: selectedResource.id, code: selectedResource.code, name: selectedResource.name },
                        {
                          onSuccess: (res: { data?: { id: number; code: string; name: string } }) => {
                            const d = res?.data;
                            if (d) setSelectedResource({ id: d.id, code: d.code, name: d.name });
                          },
                        }
                      )
                    }
                    disabled={updateResourceMutation.isPending}
                  >
                    {updateResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Lưu thay đổi
                  </Button>
                </div>
                {updateResourceMutation.isError && (
                  <p className="text-sm text-destructive mt-2">{String((updateResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi cập nhật")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
