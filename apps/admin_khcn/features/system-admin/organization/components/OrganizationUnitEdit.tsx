"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Trash2,
  Network,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Building2,
  Library,
  Settings2
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { unitTypes, domains, isLoadingTypes, isLoadingDomains, isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  // 1. Logic lọc lĩnh vực dựa trên đơn vị cha
  const domainsToOffer = useMemo(() => {
    if (parentUnit?.domainIds?.length && domains.length) {
      return domains.filter((d) => parentUnit.domainIds!.includes(d.id));
    }
    return domains;
  }, [parentUnit, domains]);

  // 2. Logic phân nhóm loại hình tổ chức (Cải tiến quan trọng)
  const groupedUnitTypes = useMemo(() => {
    return {
      admin: unitTypes.filter(t => ['Sở', 'Phòng', 'Cục', 'Vụ', 'Tổng cục', 'UBND'].some(keyword => t.name.includes(keyword))),
      service: unitTypes.filter(t => ['Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Ban'].some(keyword => t.name.includes(keyword))),
      others: unitTypes.filter(t => !['Sở', 'Phòng', 'Cục', 'Vụ', 'Tổng cục', 'UBND', 'Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Ban'].some(keyword => t.name.includes(keyword)))
    };
  }, [unitTypes]);

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "",
      name: "",
      shortName: "",
      typeId: 0,
      domainIds: [],
      scope: "",
    },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        code: unit.code ?? "",
        name: unit.name ?? "",
        shortName: unit.shortName ?? "",
        typeId: unit.typeId ?? 0,
        domainIds: unit.domainIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
    });
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-xl border bg-card shadow-md overflow-hidden animate-in fade-in duration-500">
      {/* HEADER: Thông tin cấp bậc */}
      <div className="bg-muted/40 px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-inner">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Cấu hình Đơn vị</h2>
            <div className="flex items-center text-sm text-muted-foreground font-medium italic">
              <span>{parentUnit?.name ?? "Cơ quan gốc"}</span>
              <ChevronRight className="h-4 w-4 mx-1 not-italic" />
              <span className="text-primary not-italic font-bold">{unit.name}</span>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="h-7 px-4 font-mono text-sm border-primary/20">
          Mã: {unit.code}
        </Badge>
      </div>

      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">

            {/* PHẦN 1: THÔNG TIN PHÁP LÝ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Network className="h-4 w-4" /> Định danh dữ liệu
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Các thông tin định danh chính xác theo văn bản thành lập và quy định về mã định danh điện tử.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Mã định danh (eID)</FormLabel>
                      <FormControl>
                        <Input {...field} className="font-mono bg-muted/20 focus:bg-background border-dashed" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-primary">Loại hình tổ chức</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isLoadingTypes}
                      >
                        <FormControl>
                          <SelectTrigger className="border-primary/40 ring-offset-background focus:ring-2">
                            <SelectValue placeholder="-- Chọn loại hình --" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-80">
                          {/* NHÓM HÀNH CHÍNH */}
                          {groupedUnitTypes.admin.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2 text-blue-600 py-2 border-b mb-1">
                                <Building2 className="h-3 w-3" /> Cơ quan Hành chính
                              </SelectLabel>
                              {groupedUnitTypes.admin.map(t => (
                                <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}

                          {/* NHÓM SỰ NGHIỆP */}
                          {groupedUnitTypes.service.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2 text-emerald-600 py-2 border-b mb-1 mt-2">
                                <Library className="h-3 w-3" /> Đơn vị Sự nghiệp
                              </SelectLabel>
                              {groupedUnitTypes.service.map(t => (
                                <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}

                          {/* NHÓM KHÁC */}
                          {groupedUnitTypes.others.length > 0 && (
                            <SelectGroup>
                              <SelectLabel className="flex items-center gap-2 text-slate-500 py-2 border-b mb-1 mt-2">
                                <Settings2 className="h-3 w-3" /> Khác / Giúp việc
                              </SelectLabel>
                              {groupedUnitTypes.others.map(t => (
                                <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                              ))}
                            </SelectGroup>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="font-bold">Tên đơn vị (Đầy đủ)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập theo Quyết định thành lập..." {...field} className="text-lg font-medium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* PHẦN 2: CHỨC NĂNG NHIỆM VỤ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> Chức năng & Nhiệm vụ
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Xác định lĩnh vực chuyên môn và phạm vi thẩm quyền được cơ quan cấp trên phân cấp quản lý.
                </p>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <FormField
                  control={form.control}
                  name="domainIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Lĩnh vực quản lý nhà nước</FormLabel>
                      <div className="rounded-xl border bg-muted/5 p-5 mt-2 shadow-inner min-h-[120px]">
                        {isLoadingDomains ? (
                          <div className="text-sm italic text-muted-foreground animate-pulse">Đang truy xuất danh mục lĩnh vực...</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {domainsToOffer.map((d) => (
                              <label key={d.id} className="flex items-start gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer group">
                                <Checkbox
                                  className="mt-1"
                                  checked={field.value?.includes(d.id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...(field.value ?? []), d.id]
                                      : (field.value ?? []).filter((id) => id !== d.id);
                                    field.onChange(next);
                                  }}
                                />
                                <div className="space-y-1">
                                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">{d.name}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                        {domainsToOffer.length === 0 && !isLoadingDomains && (
                          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            Cần cấu hình lĩnh vực cho đơn vị cha trước khi phân cấp cho đơn vị này.
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Địa bàn / Đối tượng quản lý
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Toàn tỉnh, Doanh nghiệp FDI, Hộ kinh doanh..." {...field} />
                      </FormControl>
                      <FormDescription className="text-[11px]">Để trống nếu quản lý theo địa giới hành chính của đơn vị.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-10 border-t">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn vị khỏi hệ thống
              </Button>

              <div className="flex w-full sm:w-auto items-center gap-4">
                <Button type="button" variant="ghost" className="px-6" onClick={() => actions.cancel()}>
                  Hủy bỏ
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none px-12 font-bold shadow-lg shadow-primary/20" disabled={isUpdating}>
                  {isUpdating ? "Đang xử lý..." : "Cập nhật dữ liệu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* ALERT DIALOG: Xóa đơn vị */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md border-2 border-destructive/20">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center">Xác nhận thao tác</AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2">
              Bạn có chắc chắn muốn xóa đơn vị <span className="text-foreground font-bold italic">&quot;{unit?.name}&quot;</span>?
              <br />Hành động này <span className="text-destructive font-bold underline">không thể hoàn tác</span>.

              {hasChildren && (
                <div className="mt-4 p-4 bg-destructive text-destructive-foreground rounded-xl text-left flex gap-3 shadow-lg">
                  <AlertCircle className="h-6 w-6 shrink-0" />
                  <span className="text-sm font-bold">
                    KHÔNG THỂ XÓA: Đơn vị đang có đơn vị con trực thuộc. Vui lòng di dời hoặc xóa các đơn vị con trước.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
            <AlertDialogCancel className="w-full sm:w-24">Quay lại</AlertDialogCancel>
            <Button
              variant="destructive"
              className="w-full sm:w-32 shadow-lg shadow-destructive/20"
              disabled={isDeleting || hasChildren}
              onClick={() => {
                actions.deleteUnit(selectedId!).then(() => {
                  actions.cancel();
                  setDeleteOpen(false);
                }).catch(() => setDeleteOpen(false));
              }}
            >
              {isDeleting ? "Đang xóa..." : "Đồng ý xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}