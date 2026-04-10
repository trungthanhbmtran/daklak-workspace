"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Trash2,
  Info,
  Network,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  AlertCircle
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
  SelectItem,
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

  const domainsToOffer =
    parentUnit?.domainIds?.length && domains.length
      ? domains.filter((d) => parentUnit.domainIds!.includes(d.id))
      : domains;

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "",
      name: "",
      shortName: "",
      typeId: unitTypes[0]?.id ?? 0,
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
        typeId: unit.typeId ?? unitTypes[0]?.id ?? 0,
        domainIds: unit.domainIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, unitTypes, form]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      typeId: values.typeId,
      domainIds: values.domainIds?.length ? values.domainIds : undefined,
      scope: values.scope?.trim() || undefined,
    });
  };

  const handleDelete = async () => {
    if (selectedId == null) return;
    try {
      await actions.deleteUnit(selectedId);
      actions.cancel();
      setDeleteOpen(false);
    } catch {
      setDeleteOpen(false);
    }
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      {/* HEADER SECTION */}
      <div className="bg-muted/30 px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Cập nhật đơn vị</h2>
            <div className="flex items-center text-xs text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
              <span>{parentUnit?.name ?? "Cơ quan Trung ương"}</span>
              <ChevronRight className="h-3 w-3 mx-1" />
              <span className="text-primary font-semibold">{unit.name}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="w-fit font-mono bg-background px-3 py-1 border-primary/20 text-primary">
          eID: {unit.code}
        </Badge>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

            {/* PHẦN 1: ĐỊNH DANH HÀNH CHÍNH */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-tight">
                <Network className="h-4 w-4" />
                <span>Thông tin định danh & Phân cấp</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="md:col-span-4">
                      <FormLabel className="font-semibold">Mã đơn vị (eID)</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: BNV_VTC" {...field} className="font-mono bg-muted/20 uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-8">
                      <FormLabel className="font-semibold">Tên đầy đủ theo Quyết định</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên chính thức của đơn vị..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel className="font-semibold text-muted-foreground">Tên viết tắt / Tên gọi khác</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Vụ Tổ chức" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="typeId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-6">
                      <FormLabel className="font-semibold text-primary">Loại hình tổ chức</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(Number(v))}
                        value={field.value ? String(field.value) : ""}
                        disabled={isLoadingTypes}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-primary/5 border-primary/20">
                            <SelectValue placeholder="Chọn loại đơn vị" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitTypes.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* PHẦN 2: CHỨC NĂNG NHIỆM VỤ */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-tight">
                <Briefcase className="h-4 w-4" />
                <span>Chức năng & Lĩnh vực quản lý</span>
              </div>

              <FormField
                control={form.control}
                name="domainIds"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex flex-col mb-3">
                      <FormLabel className="font-semibold">Lĩnh vực chuyên môn</FormLabel>
                      <FormDescription className="text-xs">
                        {parentUnit
                          ? `Giới hạn theo thẩm quyền của cơ quan cấp trên: ${parentUnit.name}`
                          : "Chọn các lĩnh vực quản lý nhà nước được giao."}
                      </FormDescription>
                    </div>

                    <div className="rounded-xl border bg-muted/10 p-4">
                      {isLoadingDomains ? (
                        <div className="flex items-center gap-2 text-sm animate-pulse">
                          <div className="h-4 w-4 bg-muted rounded-full" /> Đang tải danh mục...
                        </div>
                      ) : domainsToOffer.length === 0 ? (
                        <div className="flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-100">
                          <AlertCircle className="h-4 w-4" />
                          Cơ quan cấp trên chưa được thiết lập lĩnh vực quản lý.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                          {domainsToOffer.map((d) => (
                            <div key={d.id} className="flex items-center space-x-2 p-2 hover:bg-background rounded-md transition-colors cursor-pointer group">
                              <Checkbox
                                id={`domain-${d.id}`}
                                checked={field.value?.includes(d.id)}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), d.id]
                                    : (field.value ?? []).filter((id) => id !== d.id);
                                  field.onChange(next);
                                }}
                              />
                              <label
                                htmlFor={`domain-${d.id}`}
                                className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
                              >
                                {d.name}
                              </label>
                            </div>
                          ))}
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
                    <FormLabel className="font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Phạm vi quản lý địa bàn / đối tượng
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Toàn tỉnh, Các cơ quan thuộc Chính phủ..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-destructive hover:bg-destructive/10 hover:text-destructive font-medium"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn vị này
              </Button>

              <div className="flex w-full sm:w-auto items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => actions.cancel()}
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  className="flex-1 sm:flex-none px-10 shadow-lg shadow-primary/20"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Đang lưu hệ thống..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* ALERT DIALOG RE-DESIGN */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-[450px]">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Xác nhận xóa đơn vị</AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-3 pt-2">
              <p>
                Hành động này sẽ xóa vĩnh viễn đơn vị <strong>&quot;{unit?.name}&quot;</strong> khỏi hệ thống quản lý.
              </p>
              {hasChildren ? (
                <div className="bg-destructive/10 p-3 rounded-lg flex items-start gap-3 text-destructive text-left">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold">
                    CẢNH BÁO: Đơn vị này đang có đơn vị trực thuộc. Bạn phải điều chuyển hoặc xóa các đơn vị con trước khi thực hiện thao tác này.
                  </span>
                </div>
              ) : (
                <p className="text-xs bg-muted p-2 rounded italic">
                  Lưu ý: Chỉ có thể xóa các đơn vị không chứa dữ liệu liên kết hoặc đơn vị trực thuộc.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2 mt-4">
            <AlertDialogCancel className="w-full sm:w-28">Quay lại</AlertDialogCancel>
            <Button
              variant="destructive"
              className="w-full sm:w-28"
              disabled={isDeleting || hasChildren}
              onClick={() => handleDelete()}
            >
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}