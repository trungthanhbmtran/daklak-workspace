import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ShieldAlert, ShieldCheck, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Role, Permission } from "../types";
import { roleFormSchema, type RoleFormValues } from "../schemas";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

interface RoleFormProps {
  selectedRole: Role | null;
  createMode: boolean;
  permissions: Permission[]; // Danh sách phẳng chứa { id, action, resourceName, resourceCode }
  onSave: (data: Partial<Role>) => void;
  onDelete: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isDeleting: boolean;
}

export function RoleForm({ selectedRole, createMode, permissions, onSave, onDelete, onCancel, isSaving, isDeleting }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema) as unknown as Resolver<RoleFormValues>,
    defaultValues: {
      name: "", code: "", description: "", active: 1, permissionIds: []
    }
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    form.reset({
      name: selectedRole?.name || "",
      code: selectedRole?.code || "",
      description: selectedRole?.description || "",
      active: selectedRole?.active ?? 1,
      permissionIds: selectedRole?.permissionIds || [],
    });
  }, [selectedRole, createMode, form]);

  // Gom nhóm permissions theo Resource Name (Logic quan trọng nhất)
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
      <Card className="flex-1 w-full h-full shadow-none border-border border-dashed bg-muted/10 flex flex-col items-center justify-center p-12 text-center rounded-xl">
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
    <Card className="flex-1 w-full h-full shadow-sm border-border overflow-hidden flex flex-col rounded-xl bg-background">
      {/* HEADER SÁT MÉP */}
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
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Security Level:</span>
              <Badge variant="outline" className="text-[9px] h-4 font-mono uppercase bg-background">PBAC</Badge>
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

            {/* 2. MA TRẬN QUYỀN TRÊN TÀI NGUYÊN */}
            <div className="p-6 space-y-6 bg-muted/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Lock className="h-3.5 w-3.5 text-primary" /> 2. Quyền hạn trên tài nguyên
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-background">
                  Tổng: {permissions.length} hành động
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedPermissions).map(([resourceName, perms]) => (
                  <PermissionCardDialog key={resourceName} resourceName={resourceName} perms={perms} form={form} />
                ))}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>

      {/* FOOTER SÁT MÉP */}
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

// ============================================================================
// COMPONENT CON: NHÓM QUYỀN (PERMISSION CARD DIALOG)
// ============================================================================
function PermissionCardDialog({ resourceName, perms, form }: { resourceName: string, perms: Permission[], form: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIds = form.watch("permissionIds") || [];

  const groupPermIds = perms.map((p: Permission) => p.id);
  const selectedInGroup = selectedIds.filter((id: number) => groupPermIds.includes(id));
  const hasSelected = selectedInGroup.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="border rounded-xl bg-background shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-3 hover:border-primary/50 relative group min-h-[100px]"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="font-bold text-[13px] flex items-center gap-2 leading-tight">
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${hasSelected ? 'text-primary' : 'text-muted-foreground opacity-40'}`} />
              <span className="line-clamp-2">{resourceName}</span>
            </span>
            <code className="text-[9px] font-mono text-muted-foreground uppercase opacity-60 shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
              {perms[0]?.module || 'N/A'}
            </code>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center pr-8 mt-auto">
            {hasSelected ? (
              selectedInGroup.map((id: number) => {
                const p = perms.find((x: Permission) => x.id === id);
                return (
                  <Badge key={id} variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 shadow-none font-medium truncate max-w-[120px]">
                    {p?.action || 'Quyền'}
                  </Badge>
                );
              })
            ) : (
              <span className="text-[11px] text-muted-foreground/60 italic">Chưa cấu hình...</span>
            )}
          </div>

          <div className="absolute right-4 bottom-4 h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </DialogTrigger>

      {isOpen && (
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden bg-background">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-background z-10 shadow-sm">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Lock className="h-5 w-5 text-primary" /> Phân quyền: {resourceName}
            </DialogTitle>
            <DialogDescription className="text-xs mt-2">
              Tích chọn các quyền thuộc nhóm <strong className="text-foreground">{resourceName}</strong> mà vai trò này được phép truy cập.
              Bạn đang chọn: <strong className="text-primary">{selectedInGroup.length}/{perms.length}</strong> quyền.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 bg-muted/5 scrollbar-thin">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {perms.map((perm: Permission) => (
                <FormField key={perm.id} control={form.control} name="permissionIds" render={({ field }) => {
                  const isChecked = field.value?.includes(perm.id);
                  return (
                    <FormItem
                      className="flex flex-row items-center space-x-2.5 space-y-0 p-2.5 rounded-lg border bg-background transition-colors cursor-pointer hover:bg-muted/80 data-[state=checked]:bg-primary/5 data-[state=checked]:border-primary/30 shadow-sm"
                      data-state={isChecked ? "checked" : "unchecked"}
                    >
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = field.value || [];
                            const next = checked
                              ? [...current, perm.id]
                              : current.filter((val: number) => val !== perm.id);
                            field.onChange(next);
                          }}
                        />
                      </FormControl>
                      <div className="space-y-0.5 leading-none overflow-hidden">
                        <FormLabel className={`text-[11px] font-bold cursor-pointer transition-colors block leading-none truncate ${isChecked ? "text-primary" : "text-foreground/80"}`}>
                          {perm.action}
                        </FormLabel>
                        <p className="text-[9px] font-mono font-medium text-muted-foreground/60 uppercase truncate">
                          {perm.code ? perm.code.split('_').pop() : 'ACTION'}
                        </p>
                      </div>
                    </FormItem>
                  );
                }} />
              ))}
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
