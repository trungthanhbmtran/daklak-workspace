"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, CornerDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import type { OrganizationUnitNode } from "../types";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";
import { useOrganizationContext } from "../context/OrganizationContext";

export function OrganizationForm() {
  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits, mode, parentId } = state;
  const isCreate = mode.startsWith("create");

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

  const parentUnit =
    parentId != null ? flatUnits.find((u) => u.id === parentId) : null;
  const formKey = `create-${parentId ?? "root"}`;

  return (
    <OrganizationFormInner
      key={formKey}
      parentUnit={parentUnit}
      parentId={parentId ?? undefined}
      unitTypes={meta.unitTypes}
      domains={meta.domains}
      isLoadingTypes={meta.isLoadingTypes}
      isLoadingDomains={meta.isLoadingDomains}
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
  unitTypes,
  domains,
  isLoadingTypes,
  isLoadingDomains,
  createUnit,
  isCreating,
  onSuccess,
  onCancel,
}: {
  parentUnit: OrganizationUnitNode | null | undefined;
  parentId?: number;
  unitTypes: { id: number; code?: string; name: string }[];
  domains: { id: number; code?: string; name: string }[];
  isLoadingTypes: boolean;
  isLoadingDomains: boolean;
  createUnit: (payload: {
    code: string;
    name: string;
    shortName?: string;
    typeId: number;
    parentId?: number;
    domainIds?: number[];
    scope?: string;
  }) => Promise<unknown>;
  isCreating: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const firstTypeId = unitTypes[0]?.id ?? 0;

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "",
      name: "",
      shortName: "",
      typeId: firstTypeId,
      domainIds: [],
      scope: "",
    },
  });

  useEffect(() => {
    form.reset({
      code: "",
      name: "",
      shortName: "",
      typeId: unitTypes[0]?.id ?? 0,
      domainIds: [],
      scope: "",
    });
  }, [parentId, firstTypeId, form]);

  const domainsToOffer =
    parentId != null && parentUnit?.domainIds?.length
      ? domains.filter((d) => parentUnit.domainIds!.includes(d.id))
      : domains;

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    await createUnit({
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      typeId: values.typeId,
      parentId: parentId ?? undefined,
      domainIds: values.domainIds?.length ? values.domainIds : undefined,
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
                control={form.control}
                name="name"
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
                control={form.control}
                name="code"
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
                control={form.control}
                name="shortName"
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
              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại đơn vị <span className="text-destructive">*</span></FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : ""}
                      disabled={isLoadingTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cấp/loại đơn vị" />
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
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phạm vi quản lý (Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Toàn tỉnh, Thành phố..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domainIds"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Lĩnh vực quản lý chuyên môn</FormLabel>
                    {parentUnit?.domainIds?.length != null && parentUnit.domainIds.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Giới hạn trong lĩnh vực mà đơn vị cha <strong>{parentUnit.name}</strong> được giao.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2 max-h-[200px] overflow-y-auto rounded-lg border border-input p-4 bg-muted/10">
                      {isLoadingDomains ? (
                        <p className="text-sm text-muted-foreground col-span-full text-center py-4">Đang tải danh mục...</p>
                      ) : domainsToOffer.length === 0 && parentId != null ? (
                        <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                          Đơn vị cha chưa được thiết lập lĩnh vực quản lý. Cập nhật lĩnh vực quản lý của đơn vị cha trước.
                        </p>
                      ) : (
                        domainsToOffer.map((d) => (
                          <FormItem key={d.id} className="flex flex-row items-start space-x-3 space-y-0 p-1 rounded-md hover:bg-muted/50 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(d.id) ?? false}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...(field.value ?? []), d.id]
                                    : (field.value ?? []).filter((id) => id !== d.id);
                                  field.onChange(next);
                                }}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer leading-tight">{d.name}</FormLabel>
                          </FormItem>
                        ))
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="shrink-0 border-t bg-muted/20 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={isCreating}>
              {isCreating ? "Đang lưu..." : "Thêm đơn vị"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
