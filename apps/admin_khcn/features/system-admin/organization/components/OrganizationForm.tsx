"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
      <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="rounded-full bg-muted p-4">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Chưa có đơn vị nào được chọn</p>
            <p className="text-xs text-muted-foreground">
              Chọn đơn vị từ cây bên trái hoặc nhấn "Thêm gốc" để tạo mới.
            </p>
          </div>
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
  createUnit,
  isCreating,
  onSuccess,
  onCancel,
}: {
  parentUnit: OrganizationUnitNode | null | undefined;
  parentId?: number;
  createUnit: (payload: {
    code: string; name: string; shortName?: string; categoryCode: string;
    parentId?: number;
  }) => Promise<unknown>;
  isCreating: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: { code: "", name: "", shortName: "", categoryCode: "", domainIds: [], geographicAreaIds: [], scope: "" },
  });

  useEffect(() => {
    form.reset({ code: "", name: "", shortName: "", categoryCode: "", domainIds: [], geographicAreaIds: [], scope: "" });
  }, [parentId, form]);

  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const selectedCat  = categoryItems.find((c) => c.code === categoryCode);
  const categoryMeta = selectedCat ? parseUnitTypeCategoryMeta(selectedCat) : null;

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    await createUnit({
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      categoryCode: values.categoryCode,
      parentId: parentId ?? undefined,
    });
    onSuccess();
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden rounded-lg shadow-none">
      <CardHeader className="pb-4 shrink-0">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">
            {parentUnit ? `Trực thuộc: ${parentUnit.name}` : "Đơn vị cấp gốc"}
          </p>
          <h2 className="text-base font-semibold leading-none tracking-tight">
            Thêm đơn vị tổ chức
          </h2>
        </div>
      </CardHeader>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto pt-6 space-y-6">

            {/* ── Định danh ── */}
            <div className="space-y-4">
              <FormField control={form.control} name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên đầy đủ <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Sở Khoa học và Công nghệ tỉnh Đắk Lắk" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="shortName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên viết tắt</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VD: SKHCN" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Mã <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="SKHCN_DL" className="font-mono uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* ── Phân loại ── */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium leading-none">
                  Phân loại tổ chức <span className="text-destructive">*</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Xác định thẩm quyền ký duyệt và luồng nghiệp vụ
                </p>
              </div>
              <FormField control={form.control} name="categoryCode"
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
                <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {categoryMeta.signingAuthority && (
                      <Badge variant="secondary" className="text-xs">
                        {categoryMeta.signingAuthority === "FULL" && "Toàn quyền ký"}
                        {categoryMeta.signingAuthority === "DELEGATED" && "Ký theo ủy quyền"}
                        {categoryMeta.signingAuthority === "INTERNAL" && "Nội bộ"}
                      </Badge>
                    )}
                    {categoryMeta.politicalSystem && (
                      <Badge variant="outline" className="text-xs font-mono">
                        {categoryMeta.politicalSystem}
                      </Badge>
                    )}
                  </div>
                  {categoryMeta.purposeNote && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {categoryMeta.purposeNote}
                    </p>
                  )}
                  {categoryMeta.signingNote && (
                    <p className="text-xs text-muted-foreground flex gap-1.5 leading-relaxed">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {categoryMeta.signingNote}
                    </p>
                  )}
                </div>
              )}
              {categoryMeta?.requiredFields?.some(f => f === "domainIds" || f === "geographicAreaIds") && (
                <p className="text-xs text-muted-foreground border border-dashed rounded-md px-3 py-2">
                  Sau khi tạo đơn vị, vào tab <strong>Phạm vi phụ trách</strong> để thiết lập lĩnh vực và địa bàn.
                </p>
              )}
            </div>
          </CardContent>

          <Separator />

          <CardFooter className="pt-4 flex justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "Đang thêm..." : (
                <>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Thêm đơn vị
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
