"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, Edit, Trash2, LayoutDashboard, CornerDownRight,
  ExternalLink, Lock, CheckCircle2, ChevronDown, ChevronRight
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

import { MenuItem, Permission } from "../types";
import { menuFormSchema, type MenuFormValues } from "../schemas";
import { renderIcon } from "../utils";
import type { ViewState } from "..";

/** Fallback khi danh mục MICROSERVICE/SERVICE chưa load – khớp seed (user-service prisma/seed) */
const DEFAULT_SERVICE_LIST_FALLBACK: { code: string; name: string }[] = [
  { code: "CORE_SERVICE", name: "Core Service (Tổng quan, Cấu hình)" },
  { code: "USER_SERVICE", name: "User Service (Xác thực, PBAC, Menu)" },
  { code: "CONTENT_SERVICE", name: "Content Service (Nội dung Cổng)" },
  { code: "HRM_SERVICE", name: "HRM Service (Nhân sự)" },
  { code: "NOTIFICATION_SERVICE", name: "Notification Service (Thông báo, Email)" },
  { code: "DOCUMENT_SERVICE", name: "Document Service (Văn bản)" },
  { code: "POSTS_SERVICE", name: "Posts Service (Bài viết, Tin tức)" },
  { code: "STORAGE_SERVICE", name: "Storage Service (Kho lưu trữ)" },
  { code: "API_GATEWAY", name: "API Gateway" },
];
const EMPTY_PERMISSION_IDS: number[] = [];

// Import Custom Hooks
import { useMenuApi } from "../hooks/useMenuApi";
import { useFormLogic } from "../hooks/useFormLogic";

// ============================================================================
// 1. COMPONENT CHÍNH: MENU FORM
// ============================================================================
interface MenuFormProps {
  menus: MenuItem[];
  viewState: ViewState;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuForm({ menus, viewState, onSuccess, onCancel }: MenuFormProps) {
  // Lấy API Mutations và Options từ Hook
  const { serviceOptions, permissions, saveMenu, isSaving, deleteMenu, isDeleting } = useMenuApi();
  const { getParentPathPrefix } = useFormLogic(menus);

  const { mode, selectedId, parentId } = viewState;
  const isCreate = mode.startsWith("create");

  // Xử lý Trạng thái trống (Idle)
  if (mode === "idle") {
    return (
      <Card className="flex-1 w-full h-full shadow-none border-border flex items-center justify-center bg-muted/5 border-dashed rounded-xl transition-all">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-background rounded-full shadow-sm mb-4">
            <LayoutDashboard className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Chọn menu từ danh sách để thiết lập cấu hình</p>
        </div>
      </Card>
    );
  }

  // TẠO KEY ĐỘC NHẤT ĐỂ ÉP REACT MOUNT LẠI COMPONENT INNER (CHỐNG LẶP INFINITE LOOP)
  const formKey = isCreate ? `create-${parentId || 'root'}` : `edit-${selectedId}`;

  return (
    <MenuFormInner
      key={formKey}
      menus={menus}
      viewState={viewState}
      serviceOptions={serviceOptions}
      availablePermissions={permissions}
      getParentPathPrefix={getParentPathPrefix}
      saveMenu={saveMenu}
      isSaving={isSaving}
      deleteMenu={deleteMenu}
      isDeleting={isDeleting}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

// ============================================================================
// 2. COMPONENT LÕI: NƠI XỬ LÝ FORM & GIAO DIỆN
// ============================================================================
function MenuFormInner(props: any) {
  const {
    menus, viewState, serviceOptions, availablePermissions, getParentPathPrefix,
    saveMenu, isSaving, deleteMenu, isDeleting, onSuccess, onCancel
  } = props;

  const { mode, selectedId, parentId: viewParentId } = viewState;
  const isCreate = mode.startsWith("create");

  const serviceList = serviceOptions?.length > 0 ? serviceOptions : DEFAULT_SERVICE_LIST_FALLBACK;

  // Lấy data menu hiện tại và menu cha — parentId lấy từ viewState (khi Thêm con từ list)
  const selectedMenu = !isCreate ? menus.find((m: MenuItem) => m.id === selectedId) : null;
  const parentId = viewParentId ?? (isCreate ? undefined : selectedMenu?.parentId ?? undefined);
  const parentMenu = isCreate
    ? (parentId != null ? menus.find((m: MenuItem) => m.id === parentId) : null)
    : (selectedMenu ? menus.find((m: MenuItem) => m.id === selectedMenu.parentId) : null);

  const parentPathPrefix = getParentPathPrefix(parentMenu?.id ?? parentId ?? null);

  // Khởi tạo Form với Default Values (create: dùng parentMenu cho service/portal khi có)
  const defaultValues = useMemo(() => {
    let initialSuffix = "";
    if (!isCreate && selectedMenu?.path) {
      initialSuffix = selectedMenu.path.startsWith(parentPathPrefix)
        ? selectedMenu.path.substring(parentPathPrefix.length)
        : selectedMenu.path;
    }

    const base = isCreate
      ? {
        name: "",
        code: "",
        path: "",
        icon: "FileText",
        description: "",
        iconColor: "",
        service: parentMenu?.service ?? serviceList[0]?.code ?? "CORE_SERVICE",
        portal: parentMenu?.portal ?? "ADMIN_PORTAL",
        sort: 1,
        active: 1,
        requiredPermissionIds: EMPTY_PERMISSION_IDS,
      }
      : {
        name: selectedMenu?.name ?? "",
        code: selectedMenu?.code ?? "",
        path: initialSuffix,
        icon: selectedMenu?.icon ?? "Circle",
        description: selectedMenu?.description ?? "",
        iconColor: selectedMenu?.iconColor ?? "",
        service: selectedMenu?.service ?? serviceList[0]?.code ?? "CORE_SERVICE",
        portal: selectedMenu?.portal ?? "ADMIN_PORTAL",
        sort: selectedMenu?.sort ?? 1,
        active: selectedMenu?.active ?? 1,
        requiredPermissionIds: selectedMenu?.requiredPermissionIds || EMPTY_PERMISSION_IDS,
      };

    return base;
  }, [selectedMenu, isCreate, parentPathPrefix, parentMenu, serviceList]);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema) as unknown as Resolver<MenuFormValues>,
    defaultValues,
  });

  // Theo dõi Path để hiển thị Full Path real-time
  const watchPath = form.watch("path") || "";

  // Gom nhóm quyền
  const groupedPermissions = useMemo(() => {
    return availablePermissions.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
      const groupKey = perm.module || "Hệ thống";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(perm);
      return acc;
    }, {});
  }, [availablePermissions]);

  // Xử lý Submit: build payload rõ ràng cho API (path = full path, parentId null = gốc)
  const handleSubmit = async (values: MenuFormValues) => {
    const suffix = (values.path ?? "").replace(/^\/+/, "").trim();
    const fullPath = suffix ? `${parentPathPrefix.replace(/\/+$/, "")}/${suffix}` : parentPathPrefix.replace(/\/+$/, "") || "/";

    const payload: Partial<MenuItem> = {
      ...values,
      path: fullPath,
      target: "SELF",
    };

    if (isCreate) {
      payload.parentId = parentId ?? null;
      payload.id = undefined;
    } else {
      payload.id = selectedId;
      payload.parentId = selectedMenu?.parentId ?? null;
    }

    await saveMenu(payload);
    onSuccess();
  };

  const handleDelete = async () => {
    if (selectedId && confirm("Bạn có chắc chắn muốn xóa Menu này?")) {
      await deleteMenu(selectedId);
      onSuccess();
    }
  };

  return (
    <Card className="flex-1 w-full h-full shadow-sm border-border overflow-hidden flex flex-col rounded-xl bg-background font-sans antialiased">
      {/* HEADER SÁT MÉP */}
      <CardHeader className="bg-muted/10 border-b py-4 px-6 shrink-0 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg shadow-sm ${isCreate ? "bg-primary/10 text-primary border border-primary/10" : "bg-blue-500/10 text-blue-600 border border-blue-500/10"}`}>
            {isCreate ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{isCreate ? "Thêm mới Menu" : `Cấu hình: ${selectedMenu?.name}`}</CardTitle>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] font-mono tracking-wider uppercase px-2 py-0 h-4 bg-background">
                {isCreate ? "NEW_MENU" : selectedMenu?.code}
              </Badge>
            </div>
          </div>
        </div>
        {!isCreate && (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 h-9" disabled={isDeleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1.5" /> Xóa Menu
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
        <Form {...form}>
          <form id="menu-form" onSubmit={(e) => e.preventDefault()}>

            {/* 1. THÔNG TIN CƠ BẢN */}
            <div className="p-6 space-y-4 bg-background">
              {parentMenu && (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 text-sm font-medium text-foreground mb-6">
                  <Badge variant="secondary" className="font-semibold text-primary bg-primary/10 shadow-none">Trực thuộc</Badge>
                  {parentMenu.name}
                </div>
              )}

              <h3 className="text-[13px] font-bold text-foreground border-b pb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Tên hiển thị *</FormLabel>
                    <FormControl><Input className="h-10 bg-muted/5 focus-visible:ring-primary/20" placeholder="VD: Quản lý người dùng" {...field} /></FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )} />
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Mã hệ thống *</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 font-mono font-bold uppercase bg-muted/5 focus-visible:ring-primary/20"
                        placeholder="VD: SYS_USER"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )} />
              </div>

              <div className="pt-2">
                <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Đường dẫn truy cập (Path)</FormLabel>
                <div className="relative flex items-center shadow-sm rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-2 bg-background">
                  <div className="flex items-center justify-center px-4 bg-muted text-sm font-mono font-bold text-muted-foreground select-none h-11 border-r">
                    {parentPathPrefix}
                  </div>
                  <FormField control={form.control} name="path" render={({ field }) => (
                    <Input
                      className="h-11 font-mono text-sm border-0 focus-visible:ring-0 rounded-none bg-transparent"
                      placeholder="ten-duong-dan"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    />
                  )} />
                </div>
                <div className="flex items-center gap-1.5 px-1 mt-2 text-muted-foreground">
                  <CornerDownRight className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-mono">Full Path: <span className="font-bold text-foreground bg-muted/50 px-1.5 py-0.5 rounded">{parentPathPrefix}{watchPath}</span></span>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* 2. ĐỊNH TUYẾN & HIỂN THỊ */}
            <div className="p-6 space-y-4 bg-muted/5 border-b border-border/50">
              <h3 className="text-[13px] font-bold text-foreground border-b pb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 2. Cài đặt hệ thống
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                <FormField control={form.control} name="portal" render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Cổng truy cập</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10 bg-background"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN_PORTAL">Cổng Quản trị</SelectItem>
                        <SelectItem value="PUBLIC_PORTAL">Cổng Thông tin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="service" render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Dịch vụ (Service)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-10 bg-background"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {serviceList.map((s: { code: string, name: string }) => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <div className="flex justify-between items-center pb-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide pb-0">Biểu tượng</FormLabel>
                      <a href="https://lucide.dev/icons/" target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">Tìm icon <ExternalLink className="h-2.5 w-2.5" /></a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input className="h-10 pl-11 font-mono text-sm bg-background" placeholder="FileText" {...field} />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary p-1 bg-primary/10 rounded">{renderIcon(field.value)}</div>
                      </div>
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem className="md:col-span-2 lg:col-span-4">
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Mô tả (card Hub)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-[80px] resize-y bg-background text-sm" placeholder="Mô tả hiển thị trên thẻ phân hệ tại trang Hub. Để trống nếu không dùng." {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="iconColor" render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Màu icon (hex)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          className="h-10 w-14 rounded border border-border cursor-pointer bg-background"
                          value={field.value && /^#[0-9A-Fa-f]{6}$/.test(String(field.value)) ? String(field.value) : "#3b82f6"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <Input className="h-10 font-mono text-sm bg-background flex-1" placeholder="#3b82f6 hoặc trống" {...field} />
                      </div>
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground">Để trống = giữ màu gốc</p>
                  </FormItem>
                )} />
                <FormField control={form.control} name="sort" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Thứ tự ưu tiên</FormLabel>
                    <FormControl><Input type="number" className="h-10 bg-background" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Trạng thái</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger className={`h-10 font-bold ${field.value === 1 ? "text-primary bg-primary/5 border-primary/30" : "text-destructive bg-destructive/5"}`}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Hiển thị</SelectItem>
                        <SelectItem value="0">Tạm khóa</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
            </div>

            {/* 3. PHÂN QUYỀN */}
            <div className="p-6 space-y-4 bg-background border-t">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="space-y-1">
                  <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" /> 3. Điều kiện hiển thị Menu (Access Control)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Nhấn vào từng nhóm phân hệ bên dưới để chọn các quyền tương ứng. Đã chọn <strong className="text-primary">{form.watch("requiredPermissionIds")?.length || 0}</strong> quyền.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono bg-background shadow-sm">
                  {Object.keys(groupedPermissions).length} Nhóm phân hệ
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {Object.entries(groupedPermissions).map(([resourceName, perms]: [string, unknown]) => (
                  <PermissionCardDialog key={resourceName} resourceName={resourceName} perms={perms as Permission[]} form={form} />
                ))}
              </div>
            </div>

          </form>
        </Form>
      </CardContent>

      <div className="p-4 border-t bg-background shrink-0 flex justify-end gap-3 items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-xs font-bold h-10 px-6">
          Hủy bỏ
        </Button>
        <Button type="button" className="px-8 font-bold text-xs h-10 shadow-md transition-transform hover:scale-[1.02]" disabled={isSaving} onClick={form.handleSubmit(handleSubmit)}>
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>
    </Card>
  );
}

// ============================================================================
// 3. COMPONENT CON: NHÓM QUYỀN (PERMISSION CARD DIALOG)
// ============================================================================
function PermissionCardDialog({ resourceName, perms, form }: { resourceName: string, perms: Permission[], form: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIds = form.watch("requiredPermissionIds") || [];

  const groupPermIds = perms.map((p: Permission) => p.id);
  const selectedInGroup = selectedIds.filter((id: number) => groupPermIds.includes(id));
  const hasSelected = selectedInGroup.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="border rounded-xl bg-background shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex flex-col gap-3 hover:border-primary/50 relative group"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[13px] flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${hasSelected ? 'text-primary' : 'text-muted-foreground opacity-40'}`} />
              {resourceName}
            </span>
            <code className="text-[9px] font-mono text-muted-foreground uppercase opacity-60">
              {perms[0]?.module || 'N/A'}
            </code>
          </div>

          <div className="flex items-center justify-between">
            {hasSelected ? (
              <Badge variant="secondary" className="text-[10px] px-2 bg-primary/10 text-primary border-primary/20 shadow-none">
                Đã chọn {selectedInGroup.length} quyền
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground/80">Chưa cấu hình</span>
            )}

            <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
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
              Tích chọn các quyền thuộc nhóm <strong className="text-foreground">{resourceName}</strong> mà người dùng bắt buộc phải có.
              Bạn đang chọn: <strong className="text-primary">{selectedInGroup.length}/{perms.length}</strong> quyền.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 bg-muted/5 scrollbar-thin">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {perms.map((perm: Permission) => (
                <FormField key={perm.id} control={form.control} name="requiredPermissionIds" render={({ field }) => {
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
