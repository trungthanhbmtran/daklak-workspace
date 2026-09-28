"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, ArrowLeftCircleIcon } from "lucide-react";

import { useGetCategoryByGroup } from "../../categories/hooks/useCategoryApi";
import { UNIT_TYPE_CATEGORY_GROUP } from "../hooks/useUnitTypeCategories";
import { useUnitTypesQuery } from "../hooks/useOrganizationQueries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationContext } from "../context/OrganizationContext";
import { useOrganizationDetailQuery } from "../hooks/useOrganizationQueries";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const params = useParams<{ code: string }>();
  const rawCode = params?.code;
  const code = rawCode ? decodeURIComponent(rawCode) : "";

  const { state, actions, meta } = useOrganizationContext();
  const { flatUnits } = state;
  const { isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: detailResponse, isPending, isFetching, isPlaceholderData } = useOrganizationDetailQuery(code);
  const unit = detailResponse?.data;
  // isPlaceholderData = true khi keepPreviousData đang giữ data cũ trong lúc fetch data mới
  const isDetailLoading = isPending || isFetching || isPlaceholderData;
  const selectedId = unit?.id;

  const hasChildren = selectedId != null && flatUnits.some((u) => u.parentId === selectedId);

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: { code: "", name: "", shortName: "", categoryCode: "", typeId: undefined, domainIds: [], scope: "" },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        code: unit.code ?? "",
        name: unit.name ?? "",
        shortName: unit.shortName ?? "",
        categoryCode: unit.categoryCode ?? "",
        typeId: unit.typeId ?? undefined,
        domainIds: (unit.domains ?? []).map((d: any) => d.id),
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  const { data: categoryItems = [] } = useGetCategoryByGroup(UNIT_TYPE_CATEGORY_GROUP);
  
  const { data: unitTypesRes } = useUnitTypesQuery();
  const allUnitTypes = unitTypesRes?.data || [];

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName,
      typeId: values.typeId,
      scope: values.scope,
    });
  };

  if (isDetailLoading && !unit) {
    return (
      <div className="flex flex-col gap-4 p-6 h-full border rounded-lg">
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }
  if (selectedId == null) return null;
  if (!unit) return null;

  return (
    <>
      <Card className="rounded-lg shadow-none border-border h-full flex flex-col min-h-0 border-0 rounded-none">
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

                <FormField control={form.control} name="typeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại hình tổ chức <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(val) => {
                            const numVal = Number(val);
                            field.onChange(numVal);
                            const selectedType = allUnitTypes.find((t: any) => t.id === numVal);
                            if (selectedType) {
                              form.setValue("categoryCode", selectedType.categoryCode, { shouldDirty: true });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn loại hình tổ chức..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryItems.map(cat => {
                              const typesInCat = allUnitTypes.filter((t: any) => t.categoryCode === cat.code);
                              if (typesInCat.length === 0) return null;
                              return (
                                <SelectGroup key={cat.code}>
                                  <SelectLabel className="font-semibold text-primary">{cat.name}</SelectLabel>
                                  {typesInCat.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id.toString()} className="pl-6">
                                      {t.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </CardContent>

            <Separator />

            <CardFooter className="pt-4 pb-4 flex justify-between gap-2 shrink-0 bg-muted/10 border-t">
              <Button type="button" variant="ghost" size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Xóa</span>
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => form.reset()}>
                  <ArrowLeftCircleIcon className="h-4 w-4" />
                  <span>Hoàn tác</span>
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