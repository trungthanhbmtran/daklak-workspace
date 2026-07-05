import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ShieldAlert, ShieldCheck, Lock } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Role, Permission } from "../types";
import { roleFormSchema, type RoleFormValues } from "../schemas";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

// Lazy load: chỉ tải khi có role được chọn / tạo mới
const PolicyCardDialog = lazy(() => import("./PolicyCardDialog"));

interface RoleFormProps {
  selectedRole: Role | null;
  createMode: boolean;
  permissions: Permission[];
  isLoadingPerms?: boolean;
  onSave: (data: Partial<Role>) => void;
  onDelete: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function RoleForm({ selectedRole, createMode, permissions, isLoadingPerms, onSave, onDelete, onCancel, isSaving, isDeleting }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema) as unknown as Resolver<RoleFormValues>,
    defaultValues: {
      name: "", code: "", description: "", active: 1, policies: []
    }
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    form.reset({
      name: selectedRole?.name || "",
      code: selectedRole?.code || "",
      description: selectedRole?.description || "",
      active: selectedRole?.active ?? 1,
      policies: selectedRole?.policies || [],
    });
  }, [selectedRole, createMode, form]);

  // Gom nhóm available actions (permissions) theo Resource Name (module)
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      const groupKey = perm.module || "Hệ thống";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  if (!selectedRole && !createMode) {
    return (
      <Card className="flex-1 w-full min-h-0 shadow-none border-border border-dashed bg-muted/10 flex flex-col items-center justify-center p-12 text-center rounded-xl">
        <div className="p-4 bg-background rounded-full shadow-sm mb-4">
          <ShieldAlert className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="font-bold text-foreground">Chưa chọn Vai trò</h3>
        <p className="text-xs text-muted-foreground max-w-[220px] mt-1">
          Vui lòng chọn vai trò bên trái để bắt đầu thiết lập quyền truy cập tài nguyên.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex-1 w-full min-h-0 shadow-sm border-border overflow-hidden flex flex-col rounded-xl bg-background">
      {/* HEADER */}
      <div className="bg-muted/40 border-b py-4 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${createMode ? "bg-primary text-primary-foreground shadow-sm" : "bg-accent text-accent-foreground border"}`}>
            {createMode ? <Plus className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base font-bold leading-none">
              {createMode ? "Khởi tạo Vai trò" : `Thiết lập: ${selectedRole?.name}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Mô hình phân quyền:</span>
              <Badge variant="outline" className="text-[9px] h-4 font-mono uppercase bg-background border-primary/50 text-primary">PBAC</Badge>
            </div>
          </div>
        </div>
        {!createMode && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" disabled={isDeleting} onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
        <Form {...form}>
          <form id="role-form" onSubmit={form.handleSubmit(onSave)}>

            {/* 1. THÔNG TIN ĐỊNH DANH */}
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Định danh vai trò
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Tên vai trò *</FormLabel>
                    <FormControl><Input placeholder="VD: Quản trị viên" className="h-9 text-sm focus-visible:ring-1" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Mã vai trò (Code) *</FormLabel>
                    <FormControl><Input placeholder="VD: ADMIN" className="h-9 font-mono text-sm uppercase" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Trạng thái</FormLabel>
                    <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value.toString()}>
                      <FormControl><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="1">Đang kích hoạt</SelectItem>
                        <SelectItem value="0">Tạm khóa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="lg:col-span-3">
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả chức trách</FormLabel>
                    <FormControl><Input placeholder="Mô tả ngắn gọn phạm vi của vai trò này..." className="h-9 text-sm" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* 2. CHÍNH SÁCH TRUY CẬP (POLICIES) */}
            <div className="p-6 space-y-6 bg-muted/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Lock className="h-3.5 w-3.5 text-primary" /> 2. Chính sách truy cập tài nguyên (Policies)
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-background">
                  Đã cấu hình: {form.watch("policies").length} chính sách
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingPerms ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border rounded-xl bg-muted/30 animate-pulse h-[100px]" />
                  ))
                ) : (
                  Object.entries(groupedPermissions).map(([resourceName, perms]) => (
                    <Suspense
                      key={resourceName}
                      fallback={<div className="border rounded-xl bg-muted/30 animate-pulse h-[100px]" />}
                    >
                      <PolicyCardDialog resourceName={resourceName} perms={perms} form={form} />
                    </Suspense>
                  ))
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* FOOTER */}
      <div className="p-4 border-t bg-muted/20 shrink-0 flex justify-end gap-3 items-center">
        <Button variant="ghost" onClick={onCancel} className="text-xs font-semibold h-9 px-6">Hủy</Button>
        <Button type="submit" form="role-form" className="px-10 text-xs font-bold h-9 shadow-sm" disabled={isSaving}>
          {isSaving ? "Đang xử lý..." : "Lưu Vai trò"}
        </Button>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          onDelete();
          setIsDeleteDialogOpen(false);
        }}
        title="Xóa vai trò"
        description={`Bạn có chắc chắn muốn xóa vai trò "${selectedRole?.name}"? Hành động này không thể hoàn tác.`}
        isDeleting={isDeleting}
      />
    </Card>
  );
}

