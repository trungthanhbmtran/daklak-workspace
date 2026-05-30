"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Building2, CornerDownRight, Briefcase, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
      geoAreas={meta.geoAreas}
      isLoadingTypes={meta.isLoadingTypes}
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
  unitTypes,
  domains,
  geoAreas,
  isLoadingTypes,
  isLoadingDomains,
  isLoadingGeoAreas,
  createUnit,
  isCreating,
  onSuccess,
  onCancel,
}: {
  parentUnit: OrganizationUnitNode | null | undefined;
  parentId?: number;
  unitTypes: { id: number; code?: string; name: string }[];
  domains: { id: number; code?: string; name: string }[];
  geoAreas: { id: number; name: string }[];
  isLoadingTypes: boolean;
  isLoadingDomains: boolean;
  isLoadingGeoAreas: boolean;
  createUnit: (payload: {
    code: string;
    name: string;
    shortName?: string;
    typeId: number;
    parentId?: number;
    domainIds?: number[];
    geographicAreaIds?: number[];
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
      geographicAreaIds: [],
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
      geographicAreaIds: [],
      scope: "",
    });
  }, [parentId, firstTypeId, form]);

  const domainsToOffer =
    parentId != null && parentUnit?.domainIds?.length
      ? domains.filter((d) => parentUnit.domainIds!.includes(d.id))
      : domains;

  const [searchDomain, setSearchDomain] = useState("");
  const [searchGeo, setSearchGeo] = useState("");

  const filteredDomains = domainsToOffer.filter(d => d.name.toLowerCase().includes(searchDomain.toLowerCase()));
  const filteredGeos = (geoAreas || []).filter(g => g.name.toLowerCase().includes(searchGeo.toLowerCase()));

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    await createUnit({
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      typeId: values.typeId,
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
              <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <FormField
                  control={form.control}
                  name="domainIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> Lĩnh vực chuyên môn</span>
                        <div className="flex items-center gap-1.5">
                          {domainsToOffer.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const visibleIds = filteredDomains.map(d => d.id);
                                const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => field.value?.includes(id));
                                if (isAllSelected) {
                                  field.onChange((field.value ?? []).filter(id => !visibleIds.includes(id)));
                                } else {
                                  const current = field.value ?? [];
                                  const toAdd = visibleIds.filter(id => !current.includes(id));
                                  field.onChange([...current, ...toAdd]);
                                }
                              }}
                              className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-normal normal-case"
                            >
                              Lọc nhanh tất cả
                            </button>
                          )}
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary">{field.value?.length ?? 0} chọn</Badge>
                        </div>
                      </FormLabel>
                      {parentUnit?.domainIds?.length != null && parentUnit.domainIds.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Giới hạn trong lĩnh vực mà đơn vị cha <strong>{parentUnit.name}</strong> được giao.
                        </p>
                      )}
                      <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Tìm lĩnh vực..."
                          value={searchDomain}
                          onChange={e => setSearchDomain(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 h-8 rounded-t-lg border border-b-0 border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="border rounded-b-lg bg-muted/20 p-1.5 h-[180px] overflow-y-auto space-y-0.5 custom-scrollbar shadow-inner">
                        {isLoadingDomains ? (
                          <p className="text-xs animate-pulse italic p-1">Đang tải danh mục lĩnh vực...</p>
                        ) : filteredDomains.length === 0 && parentId != null ? (
                          <p className="text-xs text-muted-foreground p-1 text-center py-4">Đơn vị cha chưa được thiết lập lĩnh vực.</p>
                        ) : filteredDomains.length > 0 ? (
                          filteredDomains.map((d) => {
                            return (
                            <FormField
                              key={d.id}
                              control={form.control}
                              name="domainIds"
                              render={({ field: innerField }) => {
                                const isChecked = innerField.value?.includes(d.id);
                                return (
                                  <FormItem
                                    className={cn("flex flex-row items-center gap-2 space-y-0 p-1.5 rounded-md cursor-pointer transition-colors", isChecked ? "bg-background shadow-sm" : "hover:bg-background/60")}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const next = checked
                                            ? [...(innerField.value ?? []), d.id]
                                            : (innerField.value ?? []).filter(v => v !== d.id);
                                          innerField.onChange(next);
                                        }}
                                        className="h-3.5 w-3.5"
                                      />
                                    </FormControl>
                                    <FormLabel className={cn("font-normal text-xs truncate cursor-pointer flex-1 m-0", isChecked ? "text-primary font-medium" : "text-muted-foreground")}>
                                      {d.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          );
                        })
                        ) : (
                          <p className="text-xs text-muted-foreground italic p-1">Không tìm thấy.</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="geographicAreaIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-600" /> Phạm vi địa lý</span>
                        <div className="flex items-center gap-1.5">
                          {geoAreas?.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const visibleIds = filteredGeos.map(g => g.id);
                                const isAllSelected = visibleIds.length > 0 && visibleIds.every(id => field.value?.includes(id));
                                if (isAllSelected) {
                                  field.onChange((field.value ?? []).filter(id => !visibleIds.includes(id)));
                                } else {
                                  const current = field.value ?? [];
                                  const toAdd = visibleIds.filter(id => !current.includes(id));
                                  field.onChange([...current, ...toAdd]);
                                }
                              }}
                              className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 font-normal normal-case"
                            >
                              Lọc nhanh tất cả
                            </button>
                          )}
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-primary/10 text-primary">{field.value?.length ?? 0} chọn</Badge>
                        </div>
                      </FormLabel>
                      <div className="mt-2 text-xs text-transparent select-none">&nbsp;</div> {/* Spacer to align with domain helper text if present */}
                      <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Tìm tỉnh thành, khu vực..."
                          value={searchGeo}
                          onChange={e => setSearchGeo(e.target.value)}
                          className="w-full pl-8 pr-3 py-1 h-8 rounded-t-lg border border-b-0 border-input bg-background text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <div className="border rounded-b-lg bg-muted/20 p-1.5 h-[180px] overflow-y-auto space-y-0.5 custom-scrollbar shadow-inner">
                        {isLoadingGeoAreas ? (
                          <p className="text-xs animate-pulse italic p-1">Đang tải danh mục khu vực...</p>
                        ) : filteredGeos.length > 0 ? (
                          filteredGeos.map((g) => {
                            return (
                            <FormField
                              key={g.id}
                              control={form.control}
                              name="geographicAreaIds"
                              render={({ field: innerField }) => {
                                const isChecked = innerField.value?.includes(g.id);
                                return (
                                  <FormItem
                                    className={cn("flex flex-row items-center gap-2 space-y-0 p-1.5 rounded-md cursor-pointer transition-colors", isChecked ? "bg-background shadow-sm" : "hover:bg-background/60")}
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          const next = checked
                                            ? [...(innerField.value ?? []), g.id]
                                            : (innerField.value ?? []).filter(v => v !== g.id);
                                          innerField.onChange(next);
                                        }}
                                        className="h-3.5 w-3.5"
                                      />
                                    </FormControl>
                                    <FormLabel className={cn("font-normal text-xs truncate cursor-pointer flex-1 m-0", isChecked ? "text-primary font-medium" : "text-muted-foreground")}>
                                      {g.name}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          );
                        })
                        ) : (
                          <p className="text-xs text-muted-foreground italic p-1">Không tìm thấy.</p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
