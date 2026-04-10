"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil, Trash2, Network, Briefcase, ShieldCheck,
  ChevronRight, AlertCircle, Building2, Library,
  Settings2, Gavel, FileText, Landmark
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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

  /**
   * LOGIC PHÂN NHÓM LOẠI HÌNH TỔ CHỨC CHUẨN NGHIỆP VỤ
   * Chia dựa trên chức năng pháp lý thay vì chỉ dựa vào tên gọi
   */
  const groupedUnitTypes = useMemo(() => {
    return {
      // 1. Cơ quan chuyên môn: Thực hiện chức năng Quản lý Nhà nước
      administration: unitTypes.filter(t =>
        ['Sở', 'Phòng chuyên môn', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Ban Quản lý chuyên ngành'].some(k => t.name.includes(k))
      ),
      // 2. Cơ quan tham mưu, hỗ trợ: Hậu cần, kiểm tra, tổng hợp
      advisory: unitTypes.filter(t =>
        ['Văn phòng', 'Thanh tra', 'Phòng Tổng hợp'].some(k => t.name.includes(k))
      ),
      // 3. Đơn vị Sự nghiệp công lập: Cung cấp dịch vụ công (y tế, giáo dục, KHCN...)
      publicService: unitTypes.filter(t =>
        ['Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Nhà hát', 'Đài', 'Tạp chí', 'Báo'].some(k => t.name.includes(k))
      ),
      // 4. Khác: Các Ban dự án, Hội đồng, Tổ chức phối hợp
      others: unitTypes.filter(t =>
        !['Sở', 'Phòng chuyên môn', 'Cục', 'Vụ', 'Tổng cục', 'Chi cục', 'Văn phòng', 'Thanh tra', 'Trung tâm', 'Viện', 'Trường', 'Bệnh viện', 'Nhà hát', 'Đài'].some(k => t.name.includes(k))
      )
    };
  }, [unitTypes]);

  /**
   * LOGIC LỌC LĨNH VỰC: Chỉ hiển thị lĩnh vực mà đơn vị cha sở hữu (Tính kế thừa)
   */
  const domainsToOffer = useMemo(() => {
    if (parentUnit?.domainIds?.length && domains.length) {
      return domains.filter((d) => parentUnit.domainIds!.includes(d.id));
    }
    return domains;
  }, [parentUnit, domains]);

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
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
    });
  };

  if (selectedId == null || !unit) return null;

  return (
    <div className="rounded-xl border bg-card shadow-xl overflow-hidden border-slate-200">
      {/* HEADER SECTION */}
      <div className="bg-slate-50 px-6 py-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shadow-sm">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cập nhật thông tin đơn vị</h2>
            <div className="flex items-center text-sm text-slate-500 font-medium mt-1">
              <span className="hover:text-primary cursor-default transition-colors">{parentUnit?.name ?? "Cơ quan Trung ương"}</span>
              <ChevronRight className="h-4 w-4 mx-1 text-slate-300" />
              <span className="text-primary font-bold">{unit.name}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <Badge variant="outline" className="font-mono text-blue-700 border-blue-200 bg-blue-50 px-3 py-1 text-sm shadow-sm">
            {unit.code}
          </Badge>
          <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Mã định danh điện tử</span>
        </div>
      </div>

      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-10">

              {/* CỘT 1: PHÁP LÝ & CƠ CẤU */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-black uppercase text-slate-600 tracking-widest">Thông tin pháp lý</span>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-bold">Tên đơn vị (Đầy đủ)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Sở Nội vụ tỉnh..." {...field} className="h-11 text-base shadow-sm focus-visible:ring-primary/30" />
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
                      <FormLabel className="text-primary font-black uppercase text-xs tracking-wider flex items-center gap-1.5">
                        <Settings2 className="h-3.5 w-3.5" /> Loại hình tổ chức
                      </FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                        <FormControl>
                          <SelectTrigger className="h-11 border-primary/20 bg-primary/[0.01] shadow-sm">
                            <SelectValue placeholder="Xác định nhóm đơn vị..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[400px]">
                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-blue-700 py-2 border-b bg-blue-50/50 -mx-1 px-3 mb-1">
                              <Gavel className="h-4 w-4" /> Cơ quan chuyên môn (Quản lý Nhà nước)
                            </SelectLabel>
                            {groupedUnitTypes.administration.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>

                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-amber-700 py-2 border-b bg-amber-50/50 -mx-1 px-3 mb-1 mt-2">
                              <FileText className="h-4 w-4" /> Văn phòng / Thanh tra / Tham mưu
                            </SelectLabel>
                            {groupedUnitTypes.advisory.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>

                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-emerald-700 py-2 border-b bg-emerald-50/50 -mx-1 px-3 mb-1 mt-2">
                              <Library className="h-4 w-4" /> Đơn vị Sự nghiệp công lập
                            </SelectLabel>
                            {groupedUnitTypes.publicService.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>

                          <SelectGroup>
                            <SelectLabel className="flex items-center gap-2 text-slate-500 py-2 border-b bg-slate-50 -mx-1 px-3 mb-1 mt-2">
                              <Settings2 className="h-4 w-4" /> Tổ chức khác / Ban quản lý
                            </SelectLabel>
                            {groupedUnitTypes.others.map(t => (
                              <SelectItem key={t.id} value={String(t.id)} className="pl-8">{t.name}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-bold">Mã nội bộ</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 font-mono uppercase bg-slate-50 border-slate-200" />
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
                        <FormLabel className="text-slate-400 font-medium italic">Tên viết tắt</FormLabel>
                        <FormControl>
                          <Input {...field} className="h-11 bg-slate-50 border-slate-200 shadow-inner" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* CỘT 2: NGHIỆP VỤ & PHẠM VI */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <span className="text-sm font-black uppercase text-slate-600 tracking-widest">Nghiệp vụ & Thẩm quyền</span>
                </div>

                <FormField
                  control={form.control}
                  name="domainIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-end mb-2">
                        <FormLabel className="text-slate-700 font-bold">Lĩnh vực quản lý chuyên môn</FormLabel>
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 bg-amber-50">Kế thừa cấp trên</Badge>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 min-h-[200px] max-h-[280px] overflow-y-auto shadow-inner">
                        <div className="grid grid-cols-1 gap-1.5">
                          {isLoadingDomains ? (
                            <div className="flex items-center justify-center h-20 text-xs italic text-slate-400">Đang tải danh mục lĩnh vực...</div>
                          ) : domainsToOffer.length > 0 ? (
                            domainsToOffer.map((d) => (
                              <label key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer group shadow-none hover:shadow-sm">
                                <Checkbox
                                  className="h-5 w-5 border-slate-300 data-[state=checked]:bg-primary"
                                  checked={field.value?.includes(d.id)}
                                  onCheckedChange={(checked) => {
                                    const next = checked
                                      ? [...(field.value ?? []), d.id]
                                      : (field.value ?? []).filter((id) => id !== d.id);
                                    field.onChange(next);
                                  }}
                                />
                                <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors leading-tight">{d.name}</span>
                              </label>
                            ))
                          ) : (
                            <div className="p-4 text-center border-2 border-dashed rounded-lg border-slate-200 mt-4">
                              <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                              <p className="text-xs text-slate-500">Đơn vị cha chưa có lĩnh vực quản lý được phân cấp.</p>
                            </div>
                          )}
                        </div>
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
                      <FormLabel className="text-slate-700 font-bold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-600" /> Địa bàn / Phạm vi thẩm quyền
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Theo địa giới hành chính huyện, hoặc các khu kinh tế..." {...field} className="h-11 shadow-sm" />
                      </FormControl>
                      <FormDescription className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-1">
                        Cần ghi rõ nếu quản lý ngoài địa giới hành chính mặc định.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                className="w-full sm:w-auto text-slate-400 hover:text-destructive hover:bg-destructive/5 font-semibold transition-colors group"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Gỡ bỏ đơn vị
              </Button>

              <div className="flex w-full sm:w-auto items-center gap-4">
                <Button type="button" variant="outline" className="flex-1 sm:flex-none h-11 px-8 font-bold border-slate-200" onClick={() => actions.cancel()}>
                  Đóng
                </Button>
                <Button type="submit" className="flex-1 sm:flex-none h-11 px-14 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" disabled={isUpdating}>
                  {isUpdating ? "Đang xử lý dữ liệu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* ALERT DIALOG RE-DESIGNED */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="max-w-md border-0 shadow-2xl overflow-hidden p-0">
          <div className="bg-destructive/10 p-6 flex justify-center border-b border-destructive/20">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-destructive shadow-lg border-2 border-destructive/10">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <div className="p-8 space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-center text-slate-900">Xác nhận xóa đơn vị?</AlertDialogTitle>
              <AlertDialogDescription className="text-center pt-2 text-slate-600 leading-relaxed italic">
                Hệ thống sẽ xóa vĩnh viễn <span className="font-bold text-destructive not-italic">&quot;{unit?.name}&quot;</span>.
                Vui lòng cân nhắc kỹ trước khi thực hiện.

                {hasChildren && (
                  <div className="mt-6 p-4 bg-red-600 text-white rounded-xl text-left flex gap-3 shadow-xl ring-4 ring-red-100 animate-pulse">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-tight leading-4">
                      Ràng buộc dữ liệu: Đơn vị đang có đơn vị con. Hệ thống từ chối xóa để bảo vệ cấu trúc tổ chức.
                    </span>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center gap-4 pt-4 pb-2">
              <AlertDialogCancel className="w-full sm:w-28 font-bold border-slate-200">Quay lại</AlertDialogCancel>
              <Button
                variant="destructive"
                className="w-full sm:w-40 font-black uppercase shadow-lg shadow-destructive/20"
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
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}