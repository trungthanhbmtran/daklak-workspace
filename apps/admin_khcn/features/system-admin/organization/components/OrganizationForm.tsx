"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, CornerDownRight, Briefcase, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MultiSelectModal } from "./MultiSelectModal";
import { UnitTypeSelector } from "./UnitTypeSelector";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";
import type { OrganizationUnitNode } from "../types";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";
import { useOrganizationContext } from "../context/OrganizationContext";

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
    form.reset({
      code: "", name: "", shortName: "", categoryCode: "",
      domainIds: [], geographicAreaIds: [], scope: "",
    });
  }, [parentId, form]);

  // requiredFields từ server — quyết định domain/geo có hiển thị không
  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const requiredFields = categoryCode
    ? (categoryItems.find((c) => c.code === categoryCode)
        ? parseUnitTypeCategoryMeta(categoryItems.find((c) => c.code === categoryCode)!).requiredFields
        : [])
    : [];

  // Lọc lĩnh vực theo cha (kế thừa ngành dọc)
  const domainsToOffer =
    parentId != null && parentUnit?.domainIds?.length
      ? domains.filter((d) => parentUnit.domainIds!.includes(d.id))
      : domains;

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
      <div className="shrink-0 border-b bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Thêm đơn vị tổ chức</h2>
            {parentUnit ? (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <CornerDownRight className="h-3 w-3" />
                Trực thuộc: <span className="font-medium text-foreground">{parentUnit.name}</span> ({parentUnit.code})
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">Đơn vị cấp gốc</p>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
              <FormField
                control={form.control} name="name"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Tên đơn vị <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Sở Khoa học và Công nghệ tỉnh Đắk Lắk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã đơn vị <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SKHCN_DL" {...field} className="font-mono uppercase" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control} name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên viết tắt (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SKHCN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PHÂN LOẠI */}
              <FormField
                control={form.control} name="categoryCode"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Phân loại tổ chức <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <UnitTypeSelector value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* LĨNH VỰC & ĐỊA BÀN — chỉ hiển thị khi server yêu cầu */}
              {(requiredFields.includes("domainIds") || requiredFields.includes("geographicAreaIds")) && (
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  {requiredFields.includes("domainIds") && (
                    <FormField
                      control={form.control} name="domainIds"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-1.5">
                          <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 text-xs">
                            <Briefcase className="h-4 w-4 text-slate-400" /> Lĩnh vực chuyên môn
                          </FormLabel>
                          {parentUnit?.domainIds?.length ? (
                            <p className="text-xs text-muted-foreground">
                              Giới hạn trong lĩnh vực của đơn vị cha <strong>{parentUnit.name}</strong>.
                            </p>
                          ) : null}
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
            </div>
          </div>

          <div className="shrink-0 border-t bg-muted/20 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>Hủy</Button>
            <Button type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "Đang lưu..." : "Thêm đơn vị"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
