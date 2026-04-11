"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil, Trash2, Landmark, Gavel,
  ShieldCheck, Library, Users
} from "lucide-react";
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";
import { Badge } from "@/components/ui/badge";

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

  /**
   * PHÂN NHÓM LOẠI HÌNH THEO HỆ THỐNG CHÍNH TRỊ VÀ NGÀNH DỌC
   * Chuẩn Luật Tổ chức Chính phủ & Luật Tổ chức CQ địa phương
   */
  const groupedUnitTypes = useMemo(() => {
    return {
      // 1. Khối Cơ quan Đảng & Đoàn thể
      partyAndUnion: unitTypes.filter(t =>
        ['Thành ủy', 'Huyện ủy', 'Đảng ủy', 'Ban Đảng', 'Mặt trận', 'Đoàn thanh niên', 'Hội phụ nữ'].some(k => t.name.includes(k))
      ),
      // 2. Khối Cơ quan Hành chính Nhà nước (Ngành dọc từ TW đến địa phương)
      stateAdmin: unitTypes.filter(t =>
        ['Sở', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Phòng chuyên môn', 'UBND', 'HĐND'].some(k => t.name.includes(k))
      ),
      // 3. Khối Đơn vị Sự nghiệp công lập (Dịch vụ công)
      publicService: unitTypes.filter(t =>
        ['Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Đài', 'Báo'].some(k => t.name.includes(k))
      ),
      // 4. Nhóm Cơ quan Tư pháp & Khác
      judicialAndOthers: unitTypes.filter(t =>
        !['Sở', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Phòng chuyên môn', 'UBND', 'HĐND',
          'Thành ủy', 'Huyện ủy', 'Đảng ủy', 'Ban Đảng', 'Mặt trận', 'Đoàn thanh niên',
          'Trung tâm', 'Viện', 'Trường', 'Bệnh viện'].some(k => t.name.includes(k))
      )
    };
  }, [unitTypes]);

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "", name: "", shortName: "", typeId: 0, domainIds: [], scope: "",
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
    await actions.updateUnit(selectedId, values);
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="border-b bg-muted/20 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2 text-primary">
            <Landmark className="h-4 w-4" />
            Quản lý Đơn vị Hệ thống Chính trị
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Cấu hình định danh, loại hình tổ chức và thẩm quyền ngành dọc.
          </p>
        </div>
        <Badge variant="outline" className="font-mono">{unit.code}</Badge>
      </div>

      <div className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

            {/* THÔNG TIN TÊN & MÃ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="font-bold">Tên đơn vị đầy đủ</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Sở Nội vụ tỉnh..." {...field} />
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
                    <FormLabel className="font-bold uppercase text-[11px]">Mã định danh điện tử</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono bg-muted/10 uppercase" />
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
                    <FormLabel className="font-bold uppercase text-[11px]">Tên viết tắt</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* PHẦN LOẠI HÌNH TỔ CHỨC THEO LUẬT */}
            <FormField
              control={form.control}
              name="typeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-red-700">Loại hình tổ chức & Ngành dọc</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={field.value ? String(field.value) : ""}
                    disabled={isLoadingTypes}
                  >
                    <FormControl>
                      <SelectTrigger className="border-red-200 focus:ring-red-500">
                        <SelectValue placeholder="Xác định vị trí trong hệ thống chính trị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-96">
                      {/* 1. KHỐI ĐẢNG & ĐOÀN THỂ */}
                      {groupedUnitTypes.partyAndUnion.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-red-700 py-1.5 border-b mb-1">
                            <ShieldCheck className="h-3.5 w-3.5" /> Khối Cơ quan Đảng, Đoàn thể
                          </SelectLabel>
                          {groupedUnitTypes.partyAndUnion.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* 2. KHỐI QUẢN LÝ NHÀ NƯỚC (NGÀNH DỌC) */}
                      {groupedUnitTypes.stateAdmin.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-blue-700 py-1.5 border-b mb-1 mt-2">
                            <Gavel className="h-3.5 w-3.5" /> Khối Cơ quan Hành chính Nhà nước
                          </SelectLabel>
                          {groupedUnitTypes.stateAdmin.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* 3. KHỐI ĐƠN VỊ SỰ NGHIỆP */}
                      {groupedUnitTypes.publicService.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-emerald-700 py-1.5 border-b mb-1 mt-2">
                            <Library className="h-3.5 w-3.5" /> Đơn vị Sự nghiệp công lập
                          </SelectLabel>
                          {groupedUnitTypes.publicService.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* 4. KHỐI KHÁC */}
                      {groupedUnitTypes.judicialAndOthers.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-slate-500 py-1.5 border-b mb-1 mt-2">
                            <Users className="h-3.5 w-3.5" /> Cơ quan Tư pháp & Tổ chức khác
                          </SelectLabel>
                          {groupedUnitTypes.judicialAndOthers.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] italic">
                    Phân loại theo chức năng quản lý ngành dọc và quy định của Hiến pháp.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LĨNH VỰC NGÀNH */}
            <FormField
              control={form.control}
              name="domainIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Lĩnh vực quản lý chuyên ngành</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto rounded-md border border-slate-200 p-3 bg-slate-50/50 shadow-inner">
                    {isLoadingDomains ? (
                      <p className="text-xs italic">Đang truy xuất danh mục...</p>
                    ) : (
                      domainsToOffer.map((d) => (
                        <FormItem key={d.id} className="flex flex-row items-center space-x-2 space-y-0 p-1 rounded hover:bg-white transition-colors">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(d.id)}
                              onCheckedChange={(checked) => {
                                const next = checked
                                  ? [...(field.value ?? []), d.id]
                                  : (field.value ?? []).filter((id) => id !== d.id);
                                field.onChange(next);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium cursor-pointer leading-tight">{d.name}</FormLabel>
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
                  <FormLabel className="font-bold">Địa bàn / Phạm vi thẩm quyền</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Theo địa giới hành chính tỉnh..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-red-50"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa đơn vị
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => actions.cancel()}>Hủy</Button>
                <Button type="submit" disabled={isUpdating} className="px-8 shadow-sm">
                  {isUpdating ? "Đang lưu..." : "Cập nhật dữ liệu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* ALERT DIALOG */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cảnh báo xóa đơn vị</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Bạn đang thực hiện xóa đơn vị <span className="font-bold">&quot;{unit?.name}&quot;</span>.
              {hasChildren && (
                <span className="block mt-3 p-3 bg-red-50 text-red-700 rounded-md font-bold">
                  Hành động bị từ chối: Đơn vị đang có đơn vị con trực thuộc trong sơ đồ tổ chức.
                </span>
              )}
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
              Xác nhận xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}