"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ArrowLeftCircleIcon } from "lucide-react";

import { UnitTypeSelector } from "./UnitTypeSelector";
import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { parseUnitTypeCategoryMeta, UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const params = useParams<{ id: string }>();
  const selectedId = params?.id ? Number(params.id) : undefined;
  
  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits } = state;
  const { isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const unit        = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit  = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: { code: "", name: "", shortName: "", categoryCode: "", domainIds: [], scope: "" },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        code: unit.code ?? "",
        name: unit.name ?? "",
        shortName: unit.shortName ?? "",
        categoryCode: unit.categoryCode ?? "",
        domainIds: unit.domainIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const categoryCode = form.watch("categoryCode");
  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  const selectedCat  = categoryItems.find((c) => c.code === categoryCode);
  const categoryMeta = selectedCat ? parseUnitTypeCategoryMeta(selectedCat) : null;

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName,
      categoryCode: values.categoryCode,
      scope: values.scope,
    });
  };

  if (selectedId == null || !unit) return null;

  return (
    <>
      <Card className="rounded-lg shadow-none border-border h-full flex flex-col min-h-0">
        <CardHeader className="pb-4 shrink-0 bg-muted/10 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {parentUnit ? `${parentUnit.name} /` : "Cơ cấu tổ chức /"} {unit.name}
              </p>
              <h2 className="text-base font-semibold leading-none tracking-tight">
                Thông tin đơn vị
              </h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0 bg-background">{unit.code}</Badge>
          </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0">
            <CardContent className="pt-6 space-y-6 flex-1 overflow-y-auto">

              {/* ── Định danh ── */}
              <div className="space-y-4">
                <FormField control={form.control} name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đầy đủ</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          <Input {...field} className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã</FormLabel>
                        <FormControl>
                          <Input {...field} className="font-mono uppercase bg-muted" readOnly disabled />
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
                <p className="text-sm font-medium leading-none">Phân loại tổ chức</p>
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
                  </div>
                )}
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="pt-4 pb-4 flex justify-between gap-2 shrink-0 bg-muted/10 border-t">
              <Button type="button" variant="ghost" size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Xóa
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => form.reset()}>
                  <ArrowLeftCircleIcon className="h-4 w-4 mr-1.5" />
                  Hoàn tác
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating || !form.formState.isDirty}>
                  {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Xóa đơn vị này?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasChildren ? (
                <span className="font-semibold text-destructive">
                  Không thể xóa vì đơn vị này đang có các đơn vị trực thuộc.
                </span>
              ) : (
                <>
                  Bạn đang chuẩn bị xóa <strong>{unit.name}</strong>. Hành động này không thể hoàn tác.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button variant="destructive" onClick={() => {
              actions.deleteUnit(selectedId);
              setDeleteOpen(false);
            }} disabled={hasChildren || isDeleting}>
              Xóa ngay
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}