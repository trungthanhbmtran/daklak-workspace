"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Trash2,
  Landmark,
  Gavel,
  ShieldCheck,
  Library,
  Users,
  ArrowRight,
  Star,
  Info,
  ArrowLeftCircleIcon,
  Briefcase,
  MapPin,
  Search
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useOrganizationContext } from "../context/OrganizationContext";
import { organizationUnitSchema, type OrganizationUnitFormValues } from "../schemas";

export function OrganizationUnitEdit() {
  const { state, actions, meta } = useOrganizationContext();
  const { selectedId, flatUnits } = state;
  const { unitTypes, domains, geoAreas, isLoadingTypes, isLoadingDomains, isLoadingGeoAreas, isUpdating, isDeleting } = meta;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [searchDomain, setSearchDomain] = useState("");
  const [searchGeo, setSearchGeo] = useState("");

  const unit = selectedId != null ? flatUnits.find((u) => u.id === selectedId) : null;
  const hasChildren = unit != null && flatUnits.some((u) => u.parentId === unit.id);
  const parentUnit = unit?.parentId != null ? flatUnits.find((u) => u.id === unit.parentId) : null;

  /**
   * PHÂN NHÓM ĐỘC LẬP THEO CHUẨN LUẬT TỔ CHỨC
   * Đảm bảo mỗi đơn vị chỉ nằm trong 1 nhóm duy nhất (Không trùng lặp)
   */
  const groupedUnitTypes = useMemo(() => {
    const groups: {
      party: typeof unitTypes;
      state: typeof unitTypes;
      service: typeof unitTypes;
      others: typeof unitTypes;
    } = { party: [], state: [], service: [], others: [] };

    unitTypes.forEach((t) => {
      const name = t.name;
      // 1. Nhóm Đảng & Đoàn thể (Lãnh đạo chính trị)
      if (['Thành ủy', 'Huyện ủy', 'Đảng ủy', 'Chi bộ', 'Đảng bộ', 'Ban Đảng', 'Đoàn thanh niên', 'Công đoàn', 'Mặt trận'].some(k => name.includes(k))) {
        groups.party.push(t);
      }
      // 2. Nhóm Hành chính Nhà nước (Quản lý chuyên môn)
      else if (['Sở', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Phòng chuyên môn', 'UBND', 'HĐND', 'Văn phòng', 'Thanh tra'].some(k => name.includes(k))) {
        groups.state.push(t);
      }
      // 3. Nhóm Sự nghiệp (Dịch vụ công)
      else if (['Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Đài', 'Báo'].some(k => name.includes(k))) {
        groups.service.push(t);
      }
      // 4. Nhóm Khác
      else {
        groups.others.push(t);
      }
    });
    return groups;
  }, [unitTypes]);

  /**
   * Lọc lĩnh vực chuyên môn dựa trên đơn vị cha (Tính kế thừa ngành dọc)
   */
  const domainsToOffer = useMemo(() => {
    if (parentUnit?.domainIds?.length && domains.length) {
      return domains.filter((d) => parentUnit.domainIds!.includes(d.id));
    }
    return domains;
  }, [parentUnit, domains]);

  const filteredDomains = domainsToOffer.filter(d => d.name.toLowerCase().includes(searchDomain.toLowerCase()));
  const filteredGeos = (geoAreas || []).filter(g => g.name.toLowerCase().includes(searchGeo.toLowerCase()));

  const form = useForm<OrganizationUnitFormValues>({
    resolver: zodResolver(organizationUnitSchema) as unknown as Resolver<OrganizationUnitFormValues>,
    defaultValues: {
      code: "",
      name: "",
      shortName: "",
      typeId: 0,
      domainIds: [],
      geographicAreaIds: [],
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
        geographicAreaIds: unit.geographicAreaIds ?? [],
        scope: unit.scope ?? "",
      });
    }
  }, [unit, form]);

  const handleSubmit = async (values: OrganizationUnitFormValues) => {
    if (selectedId == null) return;
    await actions.updateUnit(selectedId, {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
    });
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm border-slate-200 overflow-hidden">
      {/* HEADER: Phân cấp Cha - Con */}
      <div className="border-b bg-slate-50/80 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <Landmark className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              <span>{parentUnit?.name ?? "Cơ quan Gốc"}</span>
              <ArrowRight className="h-3 w-3 mx-1.5" />
              <span className="text-primary tracking-normal">{unit.name}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Cấu hình Đơn vị</h2>
          </div>
        </div>
        <Badge variant="outline" className="font-mono bg-white text-xs px-3 border-slate-300">
          ID: {unit.code}
        </Badge>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

            {/* THÔNG TIN TÊN & ĐỊNH DANH */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold flex items-center gap-2">
                      <Pencil className="h-4 w-4 text-slate-400" />
                      Tên đầy đủ (theo Quyết định/Con dấu)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: Sở Nội vụ tỉnh ABC..." {...field} className="h-11 shadow-sm focus:border-primary" />
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
                    <FormLabel className="font-semibold text-xs uppercase text-slate-500">Mã định danh điện tử</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono bg-slate-50/50" />
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
                    <FormLabel className="font-semibold text-xs uppercase text-slate-500">Tên viết tắt</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="VD: SNV" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* LOẠI HÌNH TỔ CHỨC (PHÂN TÁCH ĐẢNG - CHÍNH QUYỀN) */}
            <section className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-black uppercase text-[11px] tracking-widest flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      Loại hình & Hệ thống chính trị
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : ""}
                      disabled={isLoadingTypes}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 border-slate-300 bg-white shadow-sm ring-offset-background focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Xác định đơn vị thuộc nhánh Đảng hay Chính quyền..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[350px]">
                        {/* 1. KHỐI ĐẢNG - Màu Đỏ */}
                        {groupedUnitTypes.party.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-red-700 bg-red-50/80 py-2 px-3 border-b border-red-100 italic">
                              <ShieldCheck className="h-4 w-4" /> Hệ thống Đảng & Đoàn thể (Lãnh đạo chính trị)
                            </SelectLabel>
                            {groupedUnitTypes.party.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8 focus:bg-red-50">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}

                        {/* 2. KHỐI CHÍNH QUYỀN - Màu Xanh */}
                        {groupedUnitTypes.state.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-blue-800 bg-blue-50/80 py-2 px-3 border-b border-blue-100 mt-2 italic">
                              <Gavel className="h-4 w-4" /> Hệ thống Chính quyền (Hành chính Nhà nước)
                            </SelectLabel>
                            {groupedUnitTypes.state.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8 focus:bg-blue-50">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}

                        {/* 3. KHỐI SỰ NGHIỆP - Màu Lục */}
                        {groupedUnitTypes.service.length > 0 && (
                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-emerald-800 bg-emerald-50/80 py-2 px-3 border-b border-emerald-100 mt-2 italic">
                              <Library className="h-4 w-4" /> Đơn vị Sự nghiệp công lập
                            </SelectLabel>
                            {groupedUnitTypes.service.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8 focus:bg-emerald-50">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-[11px] leading-relaxed flex items-start gap-1.5 mt-2 text-slate-500">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>
                        Sử dụng nhóm <b>Đảng</b> cho các tổ chức lãnh đạo chính trị (ví dụ: Đảng bộ Sở).
                        Sử dụng nhóm <b>Chính quyền</b> cho các đơn vị quản lý chuyên môn.
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* PHẠM VI QUẢN LÝ (Ghi chú thêm) */}
            <section className="space-y-4">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Phạm vi / Địa bàn quản lý (Ghi chú / Nhập liệu tự do)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Toàn tỉnh, các Doanh nghiệp Nhà nước..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* LĨNH VỰC & ĐỊA BÀN QUẢN LÝ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="domainIds"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-slate-400" /> Lĩnh vực</span>
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
                    <div className="relative">
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
                    <div className="relative">
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

            {/* FOOTER ACTIONS */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 mt-10">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-destructive hover:bg-red-50 hover:text-destructive font-semibold"
                disabled={isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Gỡ bỏ đơn vị
              </Button>

              <div className="flex w-full sm:w-auto items-center gap-3">
                <Button type="button" variant="outline" className="flex-1 sm:flex-none h-11 px-6 font-semibold" onClick={() => actions.cancel()}>
                  Hủy
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none h-11 px-10 font-bold shadow-md shadow-primary/20" disabled={isUpdating}>
                  {isUpdating ? "Đang xử lý..." : "Lưu dữ liệu"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* DIALOG XÁC NHẬN XÓA */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Xác nhận xóa đơn vị?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>Bạn đang yêu cầu gỡ bỏ <b>&quot;{unit?.name}&quot;</b> khỏi hệ thống quản lý.</p>
              {hasChildren ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3 italic font-semibold text-xs">
                  <ArrowLeftCircleIcon className="h-5 w-5 shrink-0" />
                  Hành động bị từ chối: Đơn vị đang có đơn vị con trực thuộc. Vui lòng di dời hoặc xóa đơn vị con trước.
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic underline decoration-red-200 decoration-2 underline-offset-4 uppercase font-black tracking-tighter">
                  Cảnh báo: Thao tác này không thể khôi phục sau khi xác nhận.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2 sm:justify-center">
            <AlertDialogCancel className="w-full sm:w-28 font-bold">Quay lại</AlertDialogCancel>
            <Button
              variant="destructive"
              className="w-full sm:w-32 font-bold"
              disabled={isDeleting || hasChildren}
              onClick={() => {
                actions.deleteUnit(selectedId!).then(() => {
                  actions.cancel();
                  setDeleteOpen(false);
                });
              }}
            >
              {isDeleting ? "Đang xóa..." : "Đồng ý xóa"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}