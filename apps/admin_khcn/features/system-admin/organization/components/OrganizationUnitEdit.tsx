"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Gavel, FileText, Library, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { unitTypes, domains, isLoadingTypes, isLoadingDomains, isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  const domainsToOffer =
    parentUnit?.domainIds?.length && domains.length
      ? domains.filter((d) => parentUnit.domainIds!.includes(d.id))
      : domains;

  // Logic phân nhóm loại hình tổ chức dựa trên danh mục đầu vào
  const groupedUnitTypes = useMemo(() => {
    return {
      administration: unitTypes.filter(t =>
        ['Sở', 'Phòng chuyên môn', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục'].some(k => t.name.includes(k))
      ),
      advisory: unitTypes.filter(t =>
        ['Văn phòng', 'Thanh tra'].some(k => t.name.includes(k))
      ),
      publicService: unitTypes.filter(t =>
        ['Trung tâm', 'Viện', 'Trường', 'Bệnh viện'].some(k => t.name.includes(k))
      ),
      others: unitTypes.filter(t =>
        !['Sở', 'Phòng chuyên môn', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Văn phòng', 'Thanh tra', 'Trung tâm', 'Viện', 'Trường', 'Bệnh viện'].some(k => t.name.includes(k))
      )
    };
  }, [unitTypes]);

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "",
      name: "",
      shortName: "",
      typeId: 0,
      domainIds: [],
      scope: "",
    },
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        code: unit.code ?? "",
        name: unit.name ?? "",
        shortName: unit.shortName ?? "",
        typeId: unit.typeId ?? 0,
        domainIds: unit.domainIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      code: values.code.trim(),
      name: values.name.trim(),
      shortName: values.shortName?.trim() || undefined,
      typeId: values.typeId,
      domainIds: values.domainIds?.length ? values.domainIds : undefined,
      scope: values.scope?.trim() || undefined,
    });
  };

  const handleDelete = async () => {
    if (selectedId == null) return;
    try {
      await actions.deleteUnit(selectedId);
      actions.cancel();
      setDeleteOpen(false);
    } catch {
      setDeleteOpen(false);
    }
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b bg-muted/20 px-5 py-4">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Pencil className="h-4 w-4 text-muted-foreground" />
          Cập nhật thông tin đơn vị
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Mã, tên, loại đơn vị, lĩnh vực quản lý, phạm vi.
        </p>
      </div>
      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã đơn vị</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: SND_IT" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đơn vị</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Sở Nội vụ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên viết tắt (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Sở TT&TT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHẦN LOẠI HÌNH TỔ CHỨC ĐÃ ĐƯỢC PHÂN NHÓM */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-primary">Loại hình tổ chức</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isLoadingTypes}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại hình đơn vị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Nhóm Hành chính */}
                      {groupedUnitTypes.administration.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-blue-600 border-b pb-1 mb-1">
                            <Gavel className="h-3.5 w-3.5" /> Cơ quan chuyên môn (Quản lý Nhà nước)
                          </SelectLabel>
                          {groupedUnitTypes.administration.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-6">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* Nhóm Tham mưu */}
                      {groupedUnitTypes.advisory.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-amber-600 border-b pb-1 mb-1 mt-2">
                            <FileText className="h-3.5 w-3.5" /> Văn phòng / Thanh tra
                          </SelectLabel>
                          {groupedUnitTypes.advisory.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-6">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* Nhóm Sự nghiệp */}
                      {groupedUnitTypes.publicService.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-emerald-600 border-b pb-1 mb-1 mt-2">
                            <Library className="h-3.5 w-3.5" /> Đơn vị Sự nghiệp công lập
                          </SelectLabel>
                          {groupedUnitTypes.publicService.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-6">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* Nhóm Khác */}
                      {groupedUnitTypes.others.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-slate-500 border-b pb-1 mb-1 mt-2">
                            <Settings2 className="h-3.5 w-3.5" /> Khác
                          </SelectLabel>
                          {groupedUnitTypes.others.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-6">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domainIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lĩnh vực quản lý (theo nhiệm vụ cấp trên giao, có thể chọn nhiều)</FormLabel>
                  {parentUnit?.domainIds?.length ? (
                    <p className="text-xs text-muted-foreground mb-1">
                      Chọn trong lĩnh vực mà đơn vị cha &quot;{parentUnit.name}&quot; được giao.
                    </p>
                  ) : null}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto rounded-md border border-input p-3 bg-muted/20">
                    {isLoadingDomains ? (
                      <p className="text-sm text-muted-foreground col-span-2">Đang tải...</p>
                    ) : domainsToOffer.length === 0 && parentUnit ? (
                      <p className="text-sm text-muted-foreground col-span-2">
                        Đơn vị cha chưa có lĩnh vực. Cập nhật lĩnh vực đơn vị cha trước.
                      </p>
                    ) : (
                      domainsToOffer.map((d) => (
                        <FormItem key={d.id} className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(d.id) ?? false}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...(field.value ?? []), d.id]
                                  : (field.value ?? []).filter((id) => id !== d.id);
                                field.onChange(next);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">{d.name}</FormLabel>
                        </FormItem>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phạm vi quản lý (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: Toàn tỉnh, Doanh nghiệp nhà nước" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="h-9" disabled={isUpdating}>
                {isUpdating ? "Đang lưu..." : "Lưu thông tin"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
                title={hasChildren ? "Không thể xóa khi còn đơn vị trực thuộc" : undefined}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Xóa đơn vị
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đơn vị tổ chức</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa đơn vị &quot;{unit?.name}&quot; ({unit?.code})?
              {hasChildren && (
                <span className="block mt-2 text-destructive font-medium">
                  Không thể xóa vì đơn vị đang có đơn vị trực thuộc. Hãy xóa hoặc chuyển các đơn vị con trước.
                </span>
              )}
              {!hasChildren && (
                <span className="block mt-2 text-muted-foreground">Chỉ xóa được khi không có đơn vị trực thuộc.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={isDeleting || hasChildren}
              onClick={() => handleDelete()}
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}