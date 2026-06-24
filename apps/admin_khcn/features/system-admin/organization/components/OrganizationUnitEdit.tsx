"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ArrowLeftCircleIcon, Info } from "lucide-react";

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
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
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
      <Card className="rounded-lg shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {parentUnit ? `${parentUnit.name} /` : "Cơ cấu tổ chức /"} {unit.name}
              </p>
              <h2 className="text-base font-semibold leading-none tracking-tight">
                Thông tin đơn vị
              </h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs shrink-0">{unit.code}</Badge>
          </div>
        </CardHeader>

        <Separator />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="pt-6 space-y-6">

              {/* ── Định danh ── */}
              <div className="space-y-4">
                <FormField control={form.control} name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên đầy đủ</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên theo quyết định thành lập / con dấu" {...field} />
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
                          <Input {...field} placeholder="VD: SNV" className="font-mono" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã định danh</FormLabel>
                        <FormControl>
                          <Input {...field} className="font-mono" />
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
                  <p className="text-sm font-medium leading-none">Phân loại tổ chức</p>
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
              </div>
            </CardContent>

            <Separator />

            <CardFooter className="pt-4 flex items-center justify-between gap-4">
              <Button
                type="button" variant="ghost" size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting} onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1.5" /> Gỡ bỏ đơn vị
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => actions.cancel()}>
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={isUpdating}>
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
            <AlertDialogTitle>Xác nhận gỡ bỏ đơn vị?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Bạn đang yêu cầu gỡ bỏ <strong>"{unit?.name}"</strong> khỏi hệ thống.</p>
                {hasChildren ? (
                  <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <ArrowLeftCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Đơn vị đang có đơn vị con trực thuộc. Vui lòng di dời hoặc xóa đơn vị con trước.
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Thao tác này không thể khôi phục sau khi xác nhận.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Quay lại</AlertDialogCancel>
            <Button
              variant="destructive"
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
    </>
  );
}