"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus, Edit, Trash2, CornerDownRight,
  ExternalLink, Shield, ShieldCheck, Loader2
} from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading, Text } from "@/components/ui/typography";

import { MenuItem, PbacResource } from "../types";
import { menuFormSchema, type MenuFormValues } from "../schemas";
import {
  renderIcon,
  calculateAutoSort,
  groupResourcesByServiceCode,
  generateDefaultMenuValues
} from "../utils";
import { useMenuFlatListQuery, usePbacResourcesQuery } from "../hooks/useMenuQueries";
import { useMenuSaveMutation, useMenuDeleteMutation } from "../hooks/useMenuMutations";
import { useFormLogic } from "../hooks/useFormLogic";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";

interface MenuFormProps {
  menuId?: number; // Truyền id từ route /menus/[id] để sửa. Nếu không có => tạo mới
}

export function MenuForm({ menuId }: MenuFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCreate = !menuId;
  const urlParentId = searchParams.get('parentId');

  // Chỉ fetch resources khi ở form (tạo hoặc sửa)
  const { data: menus = [] } = useMenuFlatListQuery();
  const { data: resources = [], isLoading: isLoadingResources } = usePbacResourcesQuery(true);
  const { mutateAsync: saveMenu, isPending: isSaving } = useMenuSaveMutation();
  const { mutateAsync: deleteMenu, isPending: isDeleting } = useMenuDeleteMutation();
  const { getParentPathPrefix } = useFormLogic(menus);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Lấy data menu hiện tại và menu cha
  const selectedId = menuId;
  const selectedMenu = !isCreate ? menus.find((m: MenuItem) => m.id === selectedId) : null;
  const parentId = urlParentId ? Number(urlParentId) : (isCreate ? undefined : selectedMenu?.parentId ?? undefined);
  const parentMenu = parentId ? menus.find((m: MenuItem) => m.id === parentId) : null;

  const isRootMenu = parentMenu == null && !parentId;

  // Tính số thứ tự tự động: số con hiện có + 1
  const autoSort = useMemo(() => {
    if (!isCreate) return null;
    return calculateAutoSort(menus, isRootMenu, parentId ?? null);
  }, [menus, isCreate, isRootMenu, parentId]);

  const parentPathPrefix = getParentPathPrefix(parentMenu?.id ?? parentId ?? null);

  // Nhóm resources theo serviceCode để hiển thị grouped dropdown
  const groupedResources = useMemo(() => {
    return groupResourcesByServiceCode(resources as PbacResource[]);
  }, [resources]);

  const defaultValues = useMemo(() => {
    return generateDefaultMenuValues({
      isCreate,
      selectedMenu,
      parentPathPrefix,
      isRootMenu,
      autoSort: autoSort ?? 1,
    });
  }, [isCreate, selectedMenu, parentPathPrefix, isRootMenu, autoSort]);

  const form = useForm<MenuFormValues>({
    resolver: zodResolver(menuFormSchema) as unknown as Resolver<MenuFormValues>,
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  // Theo dõi Path để hiển thị Full Path real-time
   
  const watchPath = form.watch("path") || "";
  const watchLinkedResource = form.watch("linkedResourceCode");
  const watchType = form.watch("type") || "MENU";

  // Lấy tên resource đang chọn để hiển thị badge
  const selectedResource = (resources as PbacResource[]).find(r => r.code === watchLinkedResource);

  // Xử lý Submit
  const handleSubmit = async (values: MenuFormValues) => {
    const fullPath = `${parentPathPrefix}${watchPath}`;
    const payload: Partial<MenuItem> = {
      ...values,
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
    router.push('/services/admin/menus');
  };

  const handleDelete = () => {
    if (selectedId) setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (selectedId) {
      await deleteMenu(selectedId);
      setIsDeleteDialogOpen(false);
      router.push('/services/admin/menus');
    }
  };

  const handleCancel = () => {
    router.push('/services/admin/menus');
  };

  return (
    <Card className="flex-1 w-full min-h-0 shadow-sm border-border overflow-hidden flex flex-col rounded-xl bg-background">
      {/* HEADER */}
      <div className="bg-muted/40 border-b py-4 px-6 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCreate ? "bg-primary text-primary-foreground shadow-sm" : "bg-accent text-accent-foreground border"}`}>
            {isCreate ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
          </div>
          <div>
            <CardTitle className="text-base font-bold leading-none">
              {isCreate ? `Thêm Menu ${parentMenu ? `con vào "${parentMenu.name}"` : "gốc"}` : `Thiết lập: ${selectedMenu?.name}`}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              <Text variant="small" className="text-muted-foreground uppercase tracking-tight">Loại Menu:</Text>
              <Badge variant="outline" className="text-[9px] h-4 font-mono uppercase bg-background border-primary/50 text-primary">
                {watchType === "SERVICE_ITEM" ? "PHÂN HỆ (HUB)" : "MENU LINK"}
              </Badge>
            </div>
          </div>
        </div>
        {!isCreate && selectedId && (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
        <Form {...form}>
          <form id="menu-form" onSubmit={form.handleSubmit(handleSubmit)}>
            {/* SECTION 1: THÔNG TIN CƠ BẢN */}
            <div className="p-6 space-y-5">
              <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 1. Thông tin cơ bản
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Tên hiển thị *</FormLabel>
                    <FormControl><Input className="h-9 text-sm focus-visible:ring-1 bg-background" placeholder="Ví dụ: Quản lý Người dùng" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Mã định danh *</FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 font-mono text-sm uppercase bg-background"
                        placeholder="MENU_USERS"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, ''))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Loại Menu</FormLabel>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      value={field.value ?? "MENU"}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="MENU">Menu (Link)</option>
                      <option value="SERVICE_ITEM">Phân hệ (Hub)</option>
                    </select>
                  </FormItem>
                )} />

                <FormField control={form.control} name="sort" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Thứ tự</FormLabel>
                    <FormControl><Input type="number" className="h-9 text-sm focus-visible:ring-1 bg-background" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="active" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Trạng thái</FormLabel>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                      onChange={(v) => field.onChange(parseInt(v.target.value))}
                      value={field.value?.toString()}
                    >
                      <option value="1" className="text-primary">Đang kích hoạt</option>
                      <option value="0" className="text-destructive">Tạm khóa</option>
                    </select>
                  </FormItem>
                )} />

              </div>

              {/* Path */}
              <div className="pt-2">
                <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Đường dẫn (Path)</FormLabel>
                <div className="relative flex items-center shadow-sm rounded-lg overflow-hidden border focus-within:ring-1 focus-within:ring-ring transition-all mt-1 bg-background">
                  <div className="flex items-center justify-center px-4 bg-muted text-sm font-mono font-bold text-muted-foreground select-none h-10 border-r">
                    {parentPathPrefix}
                  </div>
                  <FormField control={form.control} name="path" render={({ field }) => (
                    <Input
                      className="h-10 font-mono text-sm border-0 focus-visible:ring-0 rounded-none bg-transparent"
                      placeholder="ten-duong-dan"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-/]/g, ''))}
                    />
                  )} />
                </div>
                <div className="flex items-center gap-1.5 px-1 mt-2 text-muted-foreground">
                  <CornerDownRight className="h-3.5 w-3.5" />
                  <Text variant="small" className="font-mono">Full Path: <Text as="span" weight="bold" className="text-foreground bg-muted/50 px-1.5 py-0.5 rounded">{parentPathPrefix}{watchPath}</Text></Text>
                </div>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* SECTION 2: HIỂN THỊ */}
            <div className="p-6 space-y-5 bg-muted/5">
              <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" /> 2. Cài đặt hiển thị
              </Text>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <FormField control={form.control} name="icon" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center pb-1">
                      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground pb-0">Biểu tượng (Icon)</FormLabel>
                      <a href="https://lucide.dev/icons/" target="_blank" className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold">Tìm icon <ExternalLink className="h-2.5 w-2.5" /></a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input className="h-9 pl-11 font-mono text-sm focus-visible:ring-1 bg-background" placeholder="FileText" {...field} />
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary p-1 bg-primary/10 rounded">{renderIcon(field.value)}</div>
                      </div>
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="iconColor" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Màu icon (hex)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <input type="color"
                          className="h-9 w-14 rounded border border-border cursor-pointer bg-background"
                          value={field.value && /^#[0-9A-Fa-f]{6}$/.test(String(field.value)) ? String(field.value) : "#3b82f6"}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                        <Input className="h-9 font-mono text-sm focus-visible:ring-1 bg-background flex-1" placeholder="#3b82f6 hoặc trống" {...field} />
                      </div>
                    </FormControl>
                    <Text variant="small" className="text-muted-foreground text-[10px]">Để trống = giữ màu gốc</Text>
                  </FormItem>
                )} />

                {/* Mô tả — chỉ node gốc hoặc loại Phân hệ (hiển trên Hub card) */}
                {(isRootMenu || watchType === "SERVICE_ITEM") && (
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="lg:col-span-3">
                      <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground">Mô tả (Hiển trên thẻ Hub)</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[70px] resize-y bg-background text-sm focus-visible:ring-1" placeholder="Mô tả hiển thị trên thẻ phân hệ tại trang Hub. Để trống nếu không dùng." {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                )}
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* SECTION 3: KIỂM SOÁT TRUY CẬP — PBAC CHUẨN */}
            <div className="p-6 space-y-5 bg-background">
              <div className="flex items-center justify-between">
                <Text variant="small" className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
                  <Shield className="h-3.5 w-3.5 text-primary" /> 3. Kiểm soát truy cập (PBAC)
                </Text>
                {watchLinkedResource && selectedResource ? (
                  <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20 font-mono">
                    Bảo vệ bởi: {selectedResource.code}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground bg-muted/50">
                    Công khai
                  </Badge>
                )}
              </div>

              <FormField control={form.control} name="linkedResourceCode" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[12px] font-bold text-foreground">
                    Tài nguyên PBAC bảo vệ Menu này
                  </FormLabel>
                  <Text variant="muted" className="mb-1 text-[11px]">
                    Chỉ những người dùng được cấp quyền trên Tài nguyên bạn chọn dưới đây mới có thể nhìn thấy Menu này trên thanh Sidebar.
                  </Text>
                  {isLoadingResources ? (
                    <div className="flex items-center gap-2 h-10 text-muted-foreground text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách tài nguyên...
                    </div>
                  ) : (
                    <Combobox
                      value={field.value ?? "__PUBLIC__"}
                      onValueChange={(v) => field.onChange(v === "__PUBLIC__" ? null : v)}
                    >
                      <ComboboxInput placeholder="Tìm kiếm tài nguyên (VD: USER, SYSTEM)..." />
                      <ComboboxContent>
                        <ComboboxList>
                          <ComboboxItem value="__PUBLIC__">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                              Không kiểm soát (Công khai) — Hiển thị với tất cả user
                            </span>
                          </ComboboxItem>
                          <ComboboxSeparator />
                          {Object.entries(groupedResources).sort().map(([group, items]) => (
                            <ComboboxGroup key={group}>
                              <ComboboxLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{group}</ComboboxLabel>
                              {(items as PbacResource[]).map((r) => (
                                <ComboboxItem key={r.code} value={r.code}>
                                  <span className="flex items-center gap-2">
                                    <Text as="span" variant="code" className="text-[10px] text-muted-foreground shrink-0">{r.code}</Text>
                                    <span>{r.name}</span>
                                  </span>
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}

                  {/* Thông tin giải thích */}
                  <div className={`mt-2 p-3 rounded-lg text-[12px] border leading-relaxed ${field.value
                    ? "bg-primary/5 border-primary/20 text-primary"
                    : "bg-muted/30 border-border text-muted-foreground"
                    }`}>
                    {field.value && selectedResource ? (
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>Menu này <strong>chỉ hiển thị</strong> với những người dùng có ít nhất một quyền (Action) trên tài nguyên <strong>{selectedResource.name}</strong> (Mã: <code className="bg-primary/10 px-1 py-0.5 rounded">{selectedResource.code}</code>).</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block shrink-0" />
                        <span><strong>Menu Công Khai:</strong> Sẽ luôn luôn hiển thị trên thanh Menu đối với bất kỳ người dùng nào đăng nhập thành công vào hệ thống.</span>
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
      <div className="p-4 border-t bg-muted/20 shrink-0 flex justify-end gap-3 items-center">
        <Button type="button" variant="ghost" onClick={handleCancel} className="text-xs font-semibold h-9 px-6">Hủy</Button>
        <Button type="submit" form="menu-form" className="px-10 text-xs font-bold h-9 shadow-sm" disabled={isSaving}>
          {isSaving ? "Đang xử lý..." : "Lưu Menu"}
        </Button>
      </div>


      {isDeleteDialogOpen && (
          <ConfirmDeleteModal
                  isOpen={isDeleteDialogOpen}
                  onClose={() => setIsDeleteDialogOpen(false)}
                  onConfirm={executeDelete}
                  title="Xóa Menu"
                  description="Bạn có chắc chắn muốn xóa Menu này? Hành động này không thể hoàn tác."
                  isDeleting={isDeleting}
                />
          )}
    </Card>
  );
}
