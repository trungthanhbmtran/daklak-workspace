"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Trash2, ArrowRight, ArrowLeftCircleIcon,
  Briefcase, MapPin, Shield, Info, Pen,
  ChevronRight, Building2, BadgeCheck, Globe,
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

const COLOR_MAP: Record<string, string> = {
  blue:    "bg-blue-50 border-blue-200 text-blue-700",
  red:     "bg-red-50 border-red-200 text-red-700",
  violet:  "bg-violet-50 border-violet-200 text-violet-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  amber:   "bg-amber-50 border-amber-200 text-amber-700",
  slate:   "bg-slate-50 border-slate-200 text-slate-600",
};

const AUTHORITY_LABEL: Record<string, { label: string; color: string }> = {
  FULL:     { label: "Toàn quyền ký", color: "bg-blue-100 text-blue-700" },
  DELEGATED:{ label: "Ký theo ủy quyền", color: "bg-violet-100 text-violet-700" },
  INTERNAL: { label: "Nội bộ (không ký đối ngoại)", color: "bg-slate-100 text-slate-600" },
};

export function OrganizationUnitEdit() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { domains, geoAreas, isLoadingDomains, isLoadingGeoAreas, isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const unit       = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit  = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  /** Lọc lĩnh vực theo đơn vị cha */
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

  /* requiredFields từ server */
  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const selectedCat  = categoryItems.find((c) => c.code === categoryCode);
  const categoryMeta = selectedCat ? parseUnitTypeCategoryMeta(selectedCat) : null;
  const requiredFields = categoryMeta?.requiredFields ?? [];
  const colorClass  = COLOR_MAP[categoryMeta?.color ?? "slate"] ?? COLOR_MAP["slate"];
  const authority   = AUTHORITY_LABEL[categoryMeta?.signingAuthority ?? ""] ?? null;

  /* Preview: tên lĩnh vực & địa bàn đã chọn */
  const selectedDomainNames = useMemo(() => {
    const ids = form.watch("domainIds") ?? [];
    return domains.filter((d) => ids.includes(d.id)).map((d) => d.name);
  }, [form.watch("domainIds"), domains]);

  const selectedGeoNames = useMemo(() => {
    const ids = form.watch("geographicAreaIds") ?? [];
    return geoAreas.filter((g) => ids.includes(g.id)).map((g) => g.name);
  }, [form.watch("geographicAreaIds"), geoAreas]);

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
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">

      {/* ── BREADCRUMB HEADER ── */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white px-6 py-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Building2 className="h-4.5 w-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          {/* breadcrumb */}
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
            {parentUnit ? (
              <>
                <span className="truncate max-w-[120px]">{parentUnit.name}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </>
            ) : (
              <>
                <span>Cơ cấu tổ chức</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </>
            )}
            <span className="text-primary font-black truncate">{unit.name}</span>
          </div>
          <h2 className="text-base font-bold text-slate-800 leading-none">Cấu hình đơn vị</h2>
        </div>
        <Badge variant="outline" className="font-mono text-[11px] px-2.5 py-1 bg-white border-slate-300 shrink-0">
          {unit.code}
        </Badge>
      </div>

      {/* ── BODY ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="p-6 space-y-6">

            {/* ── 1. ĐỊNH DANH ── */}
            <section>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <Pen className="h-3 w-3" /> Thông tin định danh
              </p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField
                  control={form.control} name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-3">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">Tên đầy đủ</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên theo quyết định thành lập / con dấu" {...field} className="h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="shortName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">Tên tắt</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: SNV" className="h-10 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="code"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">Mã định danh</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-10 font-mono bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ── 2. PHÂN LOẠI TỔ CHỨC ── */}
            <section className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50/80 px-4 py-3 border-b flex items-center gap-2">
                <Shield className="h-4 w-4 text-slate-500" />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                  Phân loại tổ chức — Hệ thống chính trị
                </p>
              </div>
              <div className="p-4 space-y-4">
                <FormField
                  control={form.control} name="categoryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <UnitTypeSelector value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Metadata card từ server */}
                {categoryMeta && (
                  <div className={`rounded-lg border px-4 py-3 space-y-2 ${colorClass}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {authority && (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${authority.color}`}>
                          <BadgeCheck className="h-3 w-3" />
                          {authority.label}
                        </span>
                      )}
                      {categoryMeta.politicalSystem && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5">
                          {categoryMeta.politicalSystem}
                        </span>
                      )}
                    </div>
                    {categoryMeta.purposeNote && (
                      <p className="text-[11px] leading-relaxed opacity-80">
                        {categoryMeta.purposeNote}
                      </p>
                    )}
                    {categoryMeta.signingNote && (
                      <p className="text-[11px] leading-relaxed opacity-70 flex gap-1.5 items-start">
                        <Info className="h-3 w-3 mt-0.5 shrink-0" />
                        {categoryMeta.signingNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ── 3. LĨNH VỰC & ĐỊA BÀN ── */}
            {(requiredFields.includes("domainIds") || requiredFields.includes("geographicAreaIds")) && (
              <section className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50/80 px-4 py-3 border-b flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                    Phạm vi phụ trách
                  </p>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {requiredFields.includes("domainIds") && (
                    <div className="space-y-2">
                      <FormField
                        control={form.control} name="domainIds"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-blue-500" /> Lĩnh vực chuyên môn
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
                      {selectedDomainNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedDomainNames.slice(0, 4).map((n) => (
                            <Badge key={n} variant="secondary" className="text-[10px] h-5 px-2 bg-blue-50 text-blue-700 border-blue-200 border">
                              {n}
                            </Badge>
                          ))}
                          {selectedDomainNames.length > 4 && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-slate-100 text-slate-500">
                              +{selectedDomainNames.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {requiredFields.includes("geographicAreaIds") && (
                    <div className="space-y-2">
                      <FormField
                        control={form.control} name="geographicAreaIds"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Địa bàn phụ trách
                            </FormLabel>
                            <FormControl>
                              <MultiSelectModal
                                title="Chọn phạm vi địa lý"
                                icon={<MapPin className="h-5 w-5" />}
                                items={geoAreas}
                                selectedIds={field.value ?? []}
                                onChange={field.onChange}
                                placeholderSearch="Tìm tỉnh thành, khu vực..."
                                triggerLabel="Chọn địa bàn"
                                isLoading={isLoadingGeoAreas}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {selectedGeoNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedGeoNames.slice(0, 4).map((n) => (
                            <Badge key={n} variant="secondary" className="text-[10px] h-5 px-2 bg-emerald-50 text-emerald-700 border-emerald-200 border">
                              {n}
                            </Badge>
                          ))}
                          {selectedGeoNames.length > 4 && (
                            <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-slate-100 text-slate-500">
                              +{selectedGeoNames.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className="px-6 py-4 border-t bg-slate-50/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button
              type="button" variant="ghost"
              className="w-full sm:w-auto text-destructive hover:bg-red-50 hover:text-destructive font-semibold text-sm"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Gỡ bỏ đơn vị
            </Button>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <Button
                type="button" variant="outline"
                className="flex-1 sm:flex-none h-10 px-5 font-semibold"
                onClick={() => actions.cancel()}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-none h-10 px-8 font-bold shadow-sm"
                disabled={isUpdating}
              >
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* ── DIALOG XÁC NHẬN XÓA ── */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xác nhận gỡ bỏ đơn vị?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-1">
              <p>
                Bạn đang yêu cầu gỡ bỏ <b>"{unit?.name}"</b> khỏi hệ thống.
              </p>
              {hasChildren ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-2.5 text-xs font-semibold">
                  <ArrowLeftCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  Đơn vị đang có đơn vị con trực thuộc. Vui lòng di dời hoặc xóa đơn vị con trước.
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  ⚠ Thao tác này không thể khôi phục sau khi xác nhận.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 gap-2 sm:justify-center">
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
              {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}