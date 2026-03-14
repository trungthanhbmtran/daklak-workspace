"use client";

import { useState } from "react";
import {
  KeyRound, Search, ArrowRight, Plus, Trash2, Loader2,
  ShieldAlert, Database, Component, Check
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useResourceLogic } from "../hooks/useResourceLogic";
import type { Resource } from "../types";

const COMMON_ACTIONS = ["READ", "CREATE", "UPDATE", "DELETE", "VIEW", "EXPORT", "IMPORT", "APPROVE"];

export function ResourceClient() {
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newAction, setNewAction] = useState("");

  const {
    resources: filteredResources,
    allResources,
    isLoading,
    isError,
    searchTerm,
    setSearchTerm,
    selectedResource,
    setSelectedResource,
    currentPermissions,
    createResourceMutation,
    updateResourceMutation,
    deleteResourceMutation,
    createPermissionMutation,
    deletePermissionMutation,
  } = useResourceLogic();

  const currentActionNames = currentPermissions.map((p) => p.action);

  const handleCreateResource = () => {
    const code = newCode.trim();
    const name = newName.trim();
    if (!code || !name) return;
    createResourceMutation.mutate(
      { code, name },
      {
        onSuccess: () => {
          setNewCode("");
          setNewName("");
        },
      }
    );
  };

  const handleAddPermission = (action: string) => {
    if (!selectedResource || !action.trim()) return;
    const a = action.trim().toUpperCase();
    if (currentActionNames.includes(a)) return;
    createPermissionMutation.mutate({ resourceId: selectedResource.id, action: a });
    setNewAction("");
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
      {/* CỘT TRÁI: DANH SÁCH TÀI NGUYÊN (từ API GET /roles/permissions/matrix) */}
      <Card className="w-full lg:w-[380px] flex flex-col h-full shadow-sm border-border overflow-hidden shrink-0">
        <div className="p-4 space-y-4 border-b bg-muted/40 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" /> Bảng Tài Nguyên
            </h3>
            <Badge variant="secondary" className="font-mono">{allResources.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo tên hoặc mã..." className="pl-8 h-9 bg-background focus-visible:ring-ring" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        {/* Form thêm tài nguyên */}
        <div className="p-3 border-b bg-muted/20 shrink-0 space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Thêm tài nguyên</p>
          <Input placeholder="Mã (code)" className="h-8 text-sm font-mono" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          <Input placeholder="Tên hiển thị" className="h-8 text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button size="sm" className="w-full h-8" onClick={handleCreateResource} disabled={createResourceMutation.isPending || !newCode.trim() || !newName.trim()}>
            {createResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Thêm mới</>}
          </Button>
          {createResourceMutation.isError && (
            <p className="text-xs text-destructive">{(createResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi tạo tài nguyên"}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filteredResources.length === 0 ? (
            <div className="text-center p-4 text-sm text-muted-foreground italic">Không tìm thấy tài nguyên nào.</div>
          ) : (
            <div className="space-y-1">
              {filteredResources.map((res) => {
                const isSelected = selectedResource?.id === res.id;
                return (
                  <div
                    key={res.id}
                    className={`group flex items-center justify-between p-3 rounded-md transition-colors border border-transparent ${
                      isSelected
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
          )}
        </div>
      </Card>

      {/* ========================================== */}
      {/* CỘT PHẢI: QUẢN LÝ QUYỀN */}
      {/* ========================================== */}
      {!selectedResource ? (
        <Card className="flex-1 w-full h-full shadow-none border-border flex items-center justify-center bg-muted/20 border-dashed  rounded-xl">
          <div className="flex flex-col items-center max-w-sm text-center">
            <div className="h-20 w-20 bg-accent rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">Chưa chọn Tài nguyên</h3>
            <p className="text-sm text-muted-foreground">Vui lòng chọn một Module ở danh sách bên trái để định nghĩa các thao tác cấp quyền.</p>
          </div>
        </Card>
      ) : (
        <Card className="flex-1 w-full h-full shadow-sm border-border overflow-hidden flex flex-col">
          <CardHeader className="bg-muted/40 border-b px-8 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Phân rã Quyền: {selectedResource.name}
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
            
            {/* Sửa tài nguyên (code / name) */}
            <div className="space-y-2 p-4 rounded-lg border bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground">Cập nhật tài nguyên</h3>
              <div className="flex flex-wrap gap-2 items-end">
                <Input
                  className="h-8 font-mono max-w-[140px]"
                  placeholder="Mã"
                  value={selectedResource.code}
                  onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, code: e.target.value } : null)}
                />
                <Input
                  className="h-8 max-w-[200px]"
                  placeholder="Tên"
                  value={selectedResource.name}
                  onChange={(e) => setSelectedResource((prev) => prev ? { ...prev, name: e.target.value } : null)}
                />
                <Button
                  size="sm"
                  className="h-8"
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
                  {updateResourceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cập nhật"}
                </Button>
              </div>
              {updateResourceMutation.isError && (
                <p className="text-xs text-destructive">{String((updateResourceMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi cập nhật")}</p>
              )}
            </div>

            {/* THÊM HÀNH ĐỘNG */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                1. Khai báo hành động (Action)
              </h3>
              
              <div className="p-4 bg-accent/30 rounded-lg border border-border space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gợi ý — bấm để thêm quyền</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_ACTIONS.map((action) => {
                      const isExist = currentActionNames.includes(action);
                      return (
                        <Badge
                          key={action}
                          variant={isExist ? "secondary" : "outline"}
                          className={`font-mono text-xs py-1 px-3 cursor-pointer ${isExist ? "" : "hover:bg-primary hover:text-primary-foreground"}`}
                          onClick={() => !isExist && handleAddPermission(action)}
                        >
                          {isExist && <Check className="h-3 w-3 mr-1" />}
                          {action}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Input
                    placeholder="Action tùy chỉnh (VD: APPROVE)"
                    className="h-8 text-sm font-mono max-w-[200px]"
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPermission(newAction))}
                  />
                  <Button size="sm" className="h-8" onClick={() => handleAddPermission(newAction)} disabled={createPermissionMutation.isPending || !newAction.trim()}>
                    {createPermissionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Thêm"}
                  </Button>
                </div>
                {createPermissionMutation.isError && (
                  <p className="text-xs text-destructive">{String((createPermissionMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Lỗi thêm quyền")}</p>
                )}
              </div>
            </div>

            {/* DANH SÁCH QUYỀN ĐANG CÓ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold text-foreground">
                  2. Ma trận Quyền hiện tại
                </h3>
                <Badge variant="secondary">{currentPermissions.length} Quyền</Badge>
              </div>
              
              {currentPermissions.length === 0 ? (
                <div className="p-8 border border-dashed rounded-lg bg-muted/20 text-center">
                  <p className="text-sm text-muted-foreground italic">Tài nguyên này chưa có hành động nào được định nghĩa.</p>
                  <p className="text-xs text-muted-foreground mt-1">Hãy bấm vào các nhãn gợi ý bên trên để thêm nhanh.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentPermissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="group flex flex-col justify-between p-4 border rounded-xl bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary transition-colors" />
                      <div className="flex justify-between items-start mb-2 mt-1">
                        <span className="font-mono font-semibold text-sm">{perm.action}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={() => deletePermissionMutation.mutate(perm.id)}
                          disabled={deletePermissionMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono bg-muted inline-block px-2 py-1 rounded w-fit">
                        {selectedResource.code}:{perm.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      )}
    </div>
  );
}
