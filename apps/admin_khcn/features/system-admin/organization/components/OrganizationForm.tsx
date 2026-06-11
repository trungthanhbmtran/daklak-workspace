"use client";

import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Building2, ChevronRight, Briefcase, MapPin,
  Shield, Info, Globe, Pen, BadgeCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelectModal } from "./MultiSelectModal";
import { UnitTypeSelector } from "./UnitTypeSelector";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";
import type { OrganizationUnitNode } from "../types";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";
import { useOrganizationContext } from "../context/OrganizationContext";

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  red: "bg-red-50 border-red-200 text-red-700",
  violet: "bg-violet-50 border-violet-200 text-violet-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  slate: "bg-slate-50 border-slate-200 text-slate-600",
};
const AUTHORITY_LABEL: Record<string, { label: string; color: string }> = {
  FULL: { label: "Toàn quyền ký", color: "bg-blue-100 text-blue-700" },
  DELEGATED: { label: "Ký theo ủy quyền", color: "bg-violet-100 text-violet-700" },
  INTERNAL: { label: "Nội bộ (không ký đối ngoại)", color: "bg-slate-100 text-slate-600" },
};

export function OrganizationForm() {
  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits, mode, parentId } = state;

  if (mode === "idle") {
    return (
      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed bg-muted/20">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="rounded-full bg-muted/50 p-5">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Chọn đơn vị từ cây bên trái hoặc thêm đơn vị gốc / đơn vị con.
          </p>
        </div>
      </div>
    );
  }

  const parentUnit = parentId != null ? flatUnits.find((u) => u.id === parentId) : null;

  return (
    <OrganizationFormInner
      key={`create-${parentId ?? "root"}`}
      parentUnit={parentUnit}
      parentId={parentId ?? undefined}
      domains={meta.domains}
      geoAreas={meta.geoAreas}
      isLoadingDomains={meta.isLoadingDomains}
      isLoadingGeoAreas={meta.isLoadingGeoAreas}
      createUnit={actions.createUnit}
      isCreating={meta.isCreating}
      onSuccess={actions.cancel}
      onCancel={actions.cancel}
    />
  );
}

function OrganizationFormInner({
  parentUnit,
  parentId,
  domains,
  geoAreas,
  isLoadingDomains,
  isLoadingGeoAreas,
  createUnit,
  isCreating,
  onSuccess,
  onCancel,
}: {
  parentUnit: OrganizationUnitNode | null | undefined;
  parentId?: number;
  domains: { id: number; code?: string; name: string }[];
  geoAreas: { id: number; name: string }[];
  isLoadingDomains: boolean;
  isLoadingGeoAreas: boolean;
  createUnit: (payload: {
    code: string; name: string; shortName?: string; categoryCode: string;
    parentId?: number; domainIds?: number[]; geographicAreaIds?: number[]; scope?: string;
  }) => Promise<unknown>;
  isCreating: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "", name: "", shortName: "", categoryCode: "",
      domainIds: [], geographicAreaIds: [], scope: "",
    },
  });

  useEffect(() => {
    form.reset({ code: "", name: "", shortName: "", categoryCode: "", domainIds: [], geographicAreaIds: [], scope: "" });
  }, [parentId, form]);

  /* requiredFields từ server */
  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const selectedCat = categoryItems.find((c) => c.code === categoryCode);
  const categoryMeta = selectedCat ? parseUnitTypeCategoryMeta(selectedCat) : null;
  const requiredFields = categoryMeta?.requiredFields ?? [];
  const colorClass = COLOR_MAP[categoryMeta?.color ?? "slate"] ?? COLOR_MAP["slate"];
  const authority = AUTHORITY_LABEL[categoryMeta?.signingAuthority ?? ""] ?? null;

  /* Lọc lĩnh vực theo cha */
  const domainsToOffer = useMemo(
    () => parentUnit?.domainIds?.length ? domains.filter((d) => parentUnit.domainIds!.includes(d.id)) : domains,
    [parentUnit, domains],
  );

  /* Preview selections */
  const selectedDomainNames = useMemo(() => {
    const ids = form.watch("domainIds") ?? [];
    return domains.filter((d) => ids.includes(d.id)).map((d) => d.name);
  }, [form.watch("domainIds"), domains]);

  const selectedGeoNames = useMemo(() => {
    const ids = form.watch("geographicAreaIds") ?? [];
    return geoAreas.filter((g) => ids.includes(g.id)).map((g) => g.name);
  }, [form.watch("geographicAreaIds"), geoAreas]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    await createUnit({
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      categoryCode: values.categoryCode,
      parentId: parentId ?? undefined,
      domainIds: values.domainIds?.length ? values.domainIds : undefined,
      geographicAreaIds: values.geographicAreaIds?.length ? values.geographicAreaIds : undefined,
      scope: values.scope?.trim() || undefined,
    });
    onSuccess();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">

      {/* ── HEADER ── */}
      <div className="shrink-0 border-b bg-gradient-to-r from-slate-50 to-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
            <Plus className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
              {parentUnit ? (
                <>
                  <span className="truncate max-w-[140px]">{parentUnit.name}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="text-primary font-black">Đơn vị mới</span>
                </>
              ) : (
                <>
                  <span>Cơ cấu tổ chức</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="text-primary font-black">Đơn vị gốc mới</span>
                </>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-800 leading-none">Thêm đơn vị tổ chức</h2>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

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
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                        Tên đầy đủ <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Sở Khoa học và Công nghệ tỉnh Đắk Lắk" {...field} className="h-10" />
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
                        <Input {...field} placeholder="VD: SKHCN" className="h-10 font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control} name="code"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-xs font-semibold text-slate-500 uppercase">
                        Mã <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SKHCN_DL" className="h-10 font-mono uppercase" />
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
                  Phân loại tổ chức — Hệ thống chính trị <span className="text-destructive ml-1">*</span>
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
                      <p className="text-[11px] leading-relaxed opacity-80">{categoryMeta.purposeNote}</p>
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
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-600">Phạm vi phụ trách</p>
                  {parentUnit?.domainIds?.length ? (
                    <span className="ml-auto text-[10px] text-muted-foreground italic">
                      Giới hạn trong lĩnh vực của đơn vị cha
                    </span>
                  ) : null}
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

          {/* ── FOOTER ── */}
          <div className="shrink-0 border-t bg-slate-50/50 px-6 py-4 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" className="h-10 px-5 font-semibold" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" className="h-10 px-8 font-bold shadow-sm" disabled={isCreating}>
              {isCreating ? "Đang thêm..." : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Thêm đơn vị
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
