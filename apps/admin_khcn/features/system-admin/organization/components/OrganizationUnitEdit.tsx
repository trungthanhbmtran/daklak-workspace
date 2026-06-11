"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil, Trash2, Landmark, ArrowRight,
  Info, ArrowLeftCircleIcon, Briefcase, MapPin,
} from "lucide-react";

import { UnitTypeSelector } from "./UnitTypeSelector";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelectModal } from "./MultiSelectModal";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { domains, geoAreas, isLoadingDomains, isLoadingGeoAreas, isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  /** Lọc lĩnh vực theo đơn vị cha (kế thừa ngành dọc) */
  const domainsToOffer = useMemo(() => {
    if (parentUnit?.domainIds?.length && domains.length) {
      return domains.filter((d) => parentUnit.domainIds!.includes(d.id));
    }
    return domains;
  }, [parentUnit, domains]);

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "", name: "", shortName: "", categoryCode: "",
      domainIds: [], geographicAreaIds: [], scope: "",
    },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        code: unit.code ?? "",
        name: unit.name ?? "",
        shortName: unit.shortName ?? "",
        categoryCode: unit.categoryCode ?? "",
        domainIds: unit.domainIds ?? [],
        geographicAreaIds: unit.geographicAreaIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  // requiredFields từ server — quyết định field nào hiển thị
  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const categoryMeta = categoryItems.length
    ? parseUnitTypeCategoryMeta(categoryItems.find((c) => c.code === categoryCode) ?? categoryItems[0])
    : null;
  const requiredFields = categoryCode
    ? (categoryItems.find((c) => c.code === categoryCode)
        ? parseUnitTypeCategoryMeta(categoryItems.find((c) => c.code === categoryCode)!).requiredFields
        : [])
    : [];

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
    <div className="rounded-xl border bg-card shadow-sm border-slate-200 overflow-hidden">
      {/* HEADER */}
      <div className="border-b bg-slate-50/80 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <span>{parentUnit?.name ?? "Cơ quan Gốc"}</span>
              <ArrowRight className="h-3 w-3 mx-1.5" />
              <span className="text-primary tracking-normal">{unit.name}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Cấu hình Đơn vị</h2>
          </div>
        </div>
        <Badge variant="outline" className="font-mono bg-white text-xs px-3 border-slate-300">
          ID: {unit.code}
        </Badge>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

            {/* THÔNG TIN CƠ BẢN */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control} name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-slate-400" />
                      Tên đầy đủ (theo Quyết định/Con dấu)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Sở Nội vụ tỉnh Đắk Lắk" {...field} className="h-11 shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase text-slate-500">Mã định danh</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono bg-slate-50/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase text-slate-500">Tên viết tắt</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="VD: SNV" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* PHÂN LOẠI TỔ CHỨC */}
            <section className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
              <FormField
                control={form.control} name="categoryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-black uppercase text-[11px] tracking-widest flex items-center gap-2">
                      Phân loại tổ chức — Hệ thống chính trị
                    </FormLabel>
                    <FormControl>
                      <UnitTypeSelector value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription className="text-[11px] flex items-start gap-1.5 mt-2 text-slate-500">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      Phân loại xác định chức danh, thẩm quyền ký duyệt và luồng giao việc/điều chuyển của đơn vị.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* LĨNH VỰC & ĐỊA BÀN — chỉ show nếu server yêu cầu */}
            {(requiredFields.includes("domainIds") || requiredFields.includes("geographicAreaIds")) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {requiredFields.includes("domainIds") && (
                  <FormField
                    control={form.control} name="domainIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 text-xs">
                          <Briefcase className="h-4 w-4 text-slate-400" /> Lĩnh vực
                        </FormLabel>
                        <FormControl>
                          <MultiSelectModal
                            title="Chọn lĩnh vực chuyên môn"
                            icon={<Briefcase className="h-5 w-5" />}
                            items={domainsToOffer}
                            selectedIds={field.value ?? []}
                            onChange={field.onChange}
                            placeholderSearch="Tìm lĩnh vực..."
                            triggerLabel="Chọn lĩnh vực"
                            isLoading={isLoadingDomains}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {requiredFields.includes("geographicAreaIds") && (
                  <FormField
                    control={form.control} name="geographicAreaIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 text-xs">
                          <MapPin className="h-4 w-4 text-emerald-600" /> Phạm vi địa lý
                        </FormLabel>
                        <FormControl>
                          <MultiSelectModal
                            title="Chọn phạm vi địa lý"
                            icon={<MapPin className="h-5 w-5" />}
                            items={geoAreas}
                            selectedIds={field.value ?? []}
                            onChange={field.onChange}
                            placeholderSearch="Tìm tỉnh thành, khu vực..."
                            triggerLabel="Chọn khu vực địa lý"
                            isLoading={isLoadingGeoAreas}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
              <Button
                type="button" variant="ghost"
                className="w-full sm:w-auto text-destructive hover:bg-red-50 font-semibold"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Gỡ bỏ đơn vị
              </Button>

              <div className="flex w-full sm:w-auto items-center gap-3">
                <Button type="button" variant="outline" className="flex-1 sm:flex-none h-11 px-6 font-semibold" onClick={() => actions.cancel()}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none h-11 px-10 font-bold shadow-md shadow-primary/20" disabled={isUpdating}>
                  {isUpdating ? "Đang xử lý..." : "Lưu dữ liệu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* DIALOG XÁC NHẬN XÓA */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận xóa đơn vị?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>Bạn đang yêu cầu gỡ bỏ <b>&quot;{unit?.name}&quot;</b> khỏi hệ thống.</p>
              {hasChildren ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3 italic font-semibold text-xs">
                  <ArrowLeftCircleIcon className="h-5 w-5 shrink-0" />
                  Hành động bị từ chối: Đơn vị đang có đơn vị con trực thuộc. Vui lòng di dời hoặc xóa đơn vị con trước.
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic uppercase font-black tracking-tighter">
                  Cảnh báo: Thao tác này không thể khôi phục sau khi xác nhận.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-28 font-bold">Quay lại</AlertDialogCancel>
            <Button
              variant="destructive" className="w-full sm:w-32 font-bold"
              disabled={isDeleting || hasChildren}
              onClick={() => {
                actions.deleteUnit(selectedId!).then(() => {
                  actions.cancel();
                  setDeleteOpen(false);
                });
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