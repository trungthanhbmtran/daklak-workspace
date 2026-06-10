"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, Edit, Trash2, LayoutDashboard, CornerDownRight,
  ExternalLink, Lock, Shield, ShieldCheck, Loader2
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

import { MenuItem, PbacResource } from "../types";
import { menuFormSchema, type MenuFormValues } from "../schemas";
import { renderIcon } from "../utils";
import type { ViewState } from "..";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
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
  // Chỉ fetch resources khi mở form tạo/sửa
  const needResources = viewState.mode !== "idle";
  const { resources, isLoadingResources, saveMenu, isSaving, deleteMenu, isDeleting } = useMenuApi(needResources);
  const { getParentPathPrefix } = useFormLogic(menus);

  const { mode, selectedId, parentId } = viewState;
  const isCreate = mode.startsWith("create");

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

  const formKey = isCreate ? `create-${parentId || 'root'}` : `edit-${selectedId}`;

  return (
    <MenuFormInner
      key={formKey}
      menus={menus}
      viewState={viewState}
      resources={resources}
      isLoadingResources={isLoadingResources}
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
    menus, viewState, resources, isLoadingResources,
    getParentPathPrefix, saveMenu, isSaving, deleteMenu, isDeleting, onSuccess, onCancel
  } = props;

  const { mode, selectedId, parentId: viewParentId } = viewState;
  const isCreate = mode.startsWith("create");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Lấy data menu hiện tại và menu cha
  const selectedMenu = !isCreate ? menus.find((m: MenuItem) => m.id === selectedId) : null;
  const parentId = viewParentId ?? (isCreate ? undefined : selectedMenu?.parentId ?? undefined);
  const parentMenu = isCreate
    ? (parentId != null ? menus.find((m: MenuItem) => m.id === parentId) : null)
    : (selectedMenu ? menus.find((m: MenuItem) => m.id === selectedMenu.parentId) : null);

  const isRootMenu = parentMenu == null && parentId == null;

  // Tính số thứ tự tự động: số con hiện có + 1
  const autoSort = useMemo(() => {
    if (!isCreate) return null;
    const siblingCount = menus.filter((m: MenuItem) =>
      isRootMenu ? !m.parentId : m.parentId === (parentId ?? null)
    ).length;
    return siblingCount + 1;
  }, [menus, isCreate, isRootMenu, parentId]);

  const parentPathPrefix = getParentPathPrefix(parentMenu?.id ?? parentId ?? null);

  // Nhóm resources theo serviceCode để hiển thị grouped dropdown
  const groupedResources = useMemo(() => {
    const groups: Record<string, PbacResource[]> = {};
    for (const r of (resources as PbacResource[])) {
      const key = r.serviceCode || "Khác";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }
    return groups;
  }, [resources]);

  const defaultValues = useMemo(() => {
    let initialSuffix = "";
    if (!isCreate && selectedMenu?.path) {
      initialSuffix = selectedMenu.path.startsWith(parentPathPrefix)
        ? selectedMenu.path.substring(parentPathPrefix.length)
        : selectedMenu.path;
    }

    return isCreate
      ? {
        name: "",
        code: "",
        path: "",
        icon: isRootMenu ? "LayoutDashboard" : "FileText",
        description: "",
        iconColor: "",
        service: "",
        portal: "ADMIN_PORTAL",
        sort: autoSort ?? 1,
        active: 1,
        linkedResourceCode: null,
      }
      : {
        name: selectedMenu?.name ?? "",
        code: selectedMenu?.code ?? "",
        path: initialSuffix,
        icon: selectedMenu?.icon ?? "Circle",
        description: selectedMenu?.description ?? "",
        iconColor: selectedMenu?.iconColor ?? "",
        service: selectedMenu?.service ?? "",
        portal: selectedMenu?.portal ?? "ADMIN_PORTAL",
        sort: selectedMenu?.sort ?? 1,
        active: selectedMenu?.active ?? 1,
        linkedResourceCode: selectedMenu?.linkedResourceCode ?? null,
      };
  }, [selectedMenu, isCreate, parentPathPrefix, isRootMenu, autoSort]);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema) as unknown as Resolver<MenuFormValues>,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  // Theo dõi Path để hiển thị Full Path real-time
  const watchPath = form.watch("path") || "";
  const watchLinkedResource = form.watch("linkedResourceCode");

  // Lấy tên resource đang chọn để hiển thị badge
  const selectedResource = (resources as PbacResource[]).find(r => r.code === watchLinkedResource);

  // Xử lý Submit
  const handleSubmit = async (values: MenuFormValues) => {
    const suffix = (values.path ?? "").replace(/^\/+/, "").trim();
    const fullPath = suffix ? `${parentPathPrefix.replace(/\/+$/, "")}/${suffix}` : parentPathPrefix.replace(/\/+$/, "") || "/";

    const payload: Partial<MenuItem> = {
      ...values,
      service: "",
      portal: "ADMIN_PORTAL",
      path: fullPath,
      target: "SELF",
      linkedResourceCode: values.linkedResourceCode || null,
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

  const handleDelete = () => {
    if (selectedId) setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (selectedId) {
      await deleteMenu(selectedId);
      setIsDeleteDialogOpen(false);
      onSuccess();
    }
  };

  return (
    <Card className="flex-1 w-full h-full shadow-none border-border rounded-xl overflow-hidden flex flex-col bg-background">
      {/* HEADER */}
      <CardHeader className="p-5 border-b bg-linear-to-r from-background to-muted/20 shrink-0 flex-row items-center justify-between">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          {isCreate
            ? <><Plus className="h-4 w-4 text-primary" /> Thêm Menu {parentMenu ? `con vào "${parentMenu.name}"` : "gốc"}</>
            : <><Edit className="h-4 w-4 text-primary" /> Chỉnh sửa: {selectedMenu?.name}</>
          }
        </CardTitle>
        {!isCreate && selectedId && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>

            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
            <div className="p-6 space-y-4 border-b border-border/50">
              <h3 className="text-[13px] font-bold text-foreground border-b pb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Tên hiển thị *</FormLabel>
                    <FormControl><Input className="h-10 bg-background" placeholder="Ví dụ: Quản lý Người dùng" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Mã định danh *</FormLabel>
                    <FormControl>
                      <Input
                        className="h-10 font-mono text-sm bg-background"
                        placeholder="MENU_USERS"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex gap-3">
                  <FormField control={form.control} name="sort" render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Thứ tự</FormLabel>
                      <FormControl><Input type="number" className="h-10 bg-background" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="active" render={({ field }) => (
                    <FormItem className="flex-1">
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

              {/* Path */}
              <div className="pt-1">
                <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Đường dẫn (Path)</FormLabel>
                <div className="relative flex items-center shadow-sm rounded-lg overflow-hidden border focus-within:ring-2 focus-within:ring-primary/20 transition-all mt-2 bg-background">
                  <div className="flex items-center justify-center px-4 bg-muted text-sm font-mono font-bold text-muted-foreground select-none h-11 border-r">
                    {parentPathPrefix}
                  </div>
                  <FormField control={form.control} name="path" render={({ field }) => (
                    <Input
                      className="h-11 font-mono text-sm border-0 focus-visible:ring-0 rounded-none bg-transparent"
                      placeholder="ten-duong-dan"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-/]/g, ''))}
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

            {/* SECTION 2: HIỂN THỊ */}
            <div className="p-6 space-y-4 bg-muted/5 border-b border-border/50">
              <h3 className="text-[13px] font-bold text-foreground border-b pb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 2. Cài đặt hiển thị
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center pb-1">
                      <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide pb-0">Biểu tượng (Icon)</FormLabel>
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

                <FormField control={form.control} name="iconColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Màu icon (hex)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <input type="color"
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

                {/* Mô tả — chỉ node gốc (hiển trên Hub card) */}
                {isRootMenu && (
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">Mô tả (Hiển trên thẻ Hub)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[70px] resize-y bg-background text-sm" placeholder="Mô tả hiển thị trên thẻ phân hệ tại trang Hub. Để trống nếu không dùng." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* SECTION 3: KIỂM SOÁT TRUY CẬP — PBAC CHUẨN */}
            <div className="p-6 space-y-4 bg-background">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> 3. Kiểm soát truy cập (PBAC)
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Chọn tài nguyên mà menu này quản lý. Menu chỉ hiển thị với user có ít nhất 1 quyền trên tài nguyên đó.
                  </p>
                </div>
                {watchLinkedResource && selectedResource && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono shrink-0">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {selectedResource.code}
                  </Badge>
                )}
              </div>

              <FormField control={form.control} name="linkedResourceCode" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-wide">
                    Tài nguyên PBAC liên kết
                  </FormLabel>
                  {isLoadingResources ? (
                    <div className="flex items-center gap-2 h-10 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách tài nguyên...
                    </div>
                  ) : (
                    <Select
                      onValueChange={(v) => field.onChange(v === "__PUBLIC__" ? null : v)}
                      value={field.value ?? "__PUBLIC__"}
                    >
                      <FormControl>
                        <SelectTrigger className={`h-10 bg-background ${field.value ? "border-primary/30 text-primary" : ""}`}>
                          <SelectValue placeholder="Chọn tài nguyên..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="__PUBLIC__">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                            Công khai — hiển thị với tất cả user đăng nhập
                          </span>
                        </SelectItem>
                        <Separator className="my-1" />
                        {Object.entries(groupedResources).sort().map(([group, items]) => (
                          <SelectGroup key={group}>
                            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{group}</SelectLabel>
                            {(items as PbacResource[]).map((r) => (
                              <SelectItem key={r.code} value={r.code}>
                                <span className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{r.code}</span>
                                  <span>{r.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Thông tin giải thích */}
                  <div className={`mt-2 p-3 rounded-lg text-[11px] border ${field.value
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-muted/30 border-border text-muted-foreground"
                    }`}>
                    {field.value && selectedResource ? (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        Menu này chỉ hiện với user có quyền trên tài nguyên <strong>{selectedResource.name}</strong> ({selectedResource.code})
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block shrink-0" />
                        Menu công khai — hiển thị với tất cả user đã đăng nhập
                      </span>
                    )}
                  </div>
                </FormItem>
              )} />
            </div>

          </form>
        </Form>
      </CardContent>

      {/* FOOTER */}
      <div className="p-4 border-t bg-background shrink-0 flex justify-end gap-3 items-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <Button type="button" variant="ghost" onClick={onCancel} className="text-xs font-bold h-10 px-6">
          Hủy bỏ
        </Button>
        <Button type="button" className="px-8 font-bold text-xs h-10 shadow-md transition-transform hover:scale-[1.02]" disabled={isSaving} onClick={form.handleSubmit(handleSubmit)}>
          {isSaving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa Menu"
        description="Bạn có chắc chắn muốn xóa Menu này? Hành động này không thể hoàn tác."
        isDeleting={isDeleting}
      />
    </Card>
  );
}
