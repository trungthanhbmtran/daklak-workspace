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
    <div className="flex flex-col lg:flex-row gap-6 items-start h-full">
      {/* CỘT TRÁI: DANH SÁCH TÀI NGUYÊN */}
      <Card className="w-full lg:w-[420px] flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0">
        <div className="p-4 space-y-4 border-b bg-muted/20 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Quản lý Module / Tài nguyên
            </h3>
            <Badge variant="secondary" className="font-mono">{allResources.length}</Badge>
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
            <p className="text-xs text-destructive text-center">{String((createResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi tạo tài nguyên")}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin bg-muted/5">
          {filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Component className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground italic">Không tìm thấy tài nguyên nào.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(filteredResources.reduce((acc: Record<string, Resource[]>, res: Resource) => {
                const svc = res.serviceCode || "OTHER";
                if (!acc[svc]) acc[svc] = [];
                acc[svc].push(res);
                return acc;
              }, {} as Record<string, Resource[]>)).map(([svc, group]) => (
                <div key={svc} className="space-y-2">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 flex items-center gap-2">
                    <div className="h-px bg-border flex-1" />
                    {DEFAULT_SERVICE_LIST_FALLBACK.find(s => s.code === svc)?.name || svc}
                    <div className="h-px bg-border flex-1" />
                  </div>
                  <div className="grid gap-1">
                    {group.map((res) => {
                      const isSelected = selectedResource?.id === res.id;
                      return (
                        <div
                          key={res.id}
                          className={`group flex items-center justify-between p-2.5 rounded-lg transition-all border ${isSelected
                            ? "bg-primary/10 border-primary/20 cursor-default"
                            : "bg-background border-transparent hover:bg-accent hover:border-border cursor-pointer"
                            }`}
                          onClick={() => setSelectedResource(res)}
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
                              <ArrowRight className="h-4 w-4 text-primary opacity-70" />
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); deleteResourceMutation.mutate(res.id); }}
                                disabled={deleteResourceMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phân trang */}
        {totalResources > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              {(page - 1) * pageSize + 1} – {Math.min(page * pageSize, totalResources)} / {totalResources}
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

      {/* CỘT PHẢI: CHI TIẾT & CHỈNH SỬA */}
      <div className="flex-1 h-full min-w-0 hidden lg:block overflow-y-auto p-1">
        {!selectedResource ? (
          <Card className="w-full h-full shadow-sm border-border flex items-center justify-center bg-muted/10 border-dashed rounded-xl">
            <div className="flex flex-col items-center max-w-sm text-center">
              <div className="h-16 w-16 bg-background border rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Component className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Chưa chọn Tài nguyên</h3>
              <p className="text-sm text-muted-foreground">Vui lòng chọn một Module ở danh sách bên trái để xem và chỉnh sửa thông tin.</p>
            </div>
          </Card>
        ) : (
          <Card className="w-full h-fit shadow-sm border-border overflow-hidden flex flex-col transition-all">
            <CardHeader className="bg-muted/20 border-b px-8 py-6 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {selectedResource.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Mã định danh:</span>
                    <Badge variant="outline" className="font-mono bg-background text-foreground px-2 py-0.5">
                      {selectedResource.code}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-8">
              <div className="max-w-xl space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">Cập nhật thông tin</h3>
                  <p className="text-sm text-muted-foreground mb-4">Thay đổi tên hiển thị hoặc mã hệ thống của tài nguyên này.</p>
                </div>
                
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Tên hiển thị</label>
                    <Input
                      className="h-10"
                      placeholder="VD: Quản lý người dùng"
                      value={selectedResource.name}
                      onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-foreground">Mã hệ thống (Code)</label>
                    <Input
                      className="h-10 font-mono"
                      placeholder="VD: USERS_MANAGE"
                      value={selectedResource.code}
                      onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, code: e.target.value } : null)}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button
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
                      className="w-auto"
                    >
                      {updateResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Lưu thay đổi
                    </Button>
                  </div>
                  
                  {updateResourceMutation.isError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-2">
                      <p className="text-sm text-destructive font-medium">{String((updateResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Có lỗi xảy ra khi cập nhật tài nguyên.")}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
