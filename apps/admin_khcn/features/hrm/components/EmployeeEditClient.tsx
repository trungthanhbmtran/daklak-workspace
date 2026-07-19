"use client";

import { useState, useMemo, useRef, useEffect, use } from "react";
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft, Save, User, Camera,
  Loader2, Mail, Phone, CreditCard, Calendar,
  Building2, Check, Hash, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useHrmEmployee, useUpdateHrmEmployee } from "@/features/hrm/hooks/useHrmEmployees";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetCategoryByGroup } from "@/features/system-admin/categories/hooks/useCategoryApi";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heading, Text } from "@/components/ui/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  firstname: z.string().min(1, "Họ và đệm không được để trống"),
  lastname: z.string().min(1, "Tên không được để trống"),
  employeeCode: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  identityCard: z.string().optional(),
  departmentId: z.number({ message: "Vui lòng chọn đơn vị" }),
  jobTitleId: z.number().optional(),
  civilServantRankId: z.number({ message: "Vui lòng chọn ngạch công chức" }),
  partyTitleId: z.number().optional(),
  startDate: z.string().optional(),
  birthday: z.string().optional(),
  avatar: z.string().optional(),
});

function flattenUnits(nodes: any[], acc: any[] = [], parentPath: string = ""): any[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} / ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({ id: node.id, name: node.name, fullPath: currentPath, code: node.code });
    }
    flattenUnits(node.children ?? [], acc, currentPath);
  }
  return acc;
}

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = typeof (params as Promise<{ id: string }>).then === "function" ? use(params as Promise<{ id: string }>) : (params as unknown as { id: string });
  const employeeId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [submitting, setSubmitting] = useState(false);

  const { data: employee, isLoading: isLoadingEmployee } = useHrmEmployee(employeeId);
  const { mutateAsync: updateEmployee } = useUpdateHrmEmployee();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      employeeCode: "",
      email: "",
      phone: "",
      identityCard: "",
      startDate: new Date().toISOString().slice(0, 10),
      birthday: "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        firstname: employee.firstname || "",
        lastname: employee.lastname || "",
        employeeCode: employee.employeeCode || "",
        email: employee.email || "",
        phone: employee.phone || "",
        identityCard: employee.identityCard || "",
        departmentId: (employee.departmentId && employee.departmentId > 0) ? employee.departmentId : undefined as any,
        jobTitleId: (employee.jobTitleId && employee.jobTitleId > 0) ? employee.jobTitleId : undefined,
        civilServantRankId: (employee.civilServantRankId && employee.civilServantRankId > 0) ? employee.civilServantRankId : undefined as any,
        partyTitleId: (employee.partyTitleId && employee.partyTitleId > 0) ? employee.partyTitleId : undefined,
        startDate: employee.startDate ? employee.startDate.toString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        birthday: employee.birthday ? employee.birthday.toString().slice(0, 10) : "",
        avatar: employee.avatar || "",
      });
    } else if (employee === null) {
      toast.error("Không tìm thấy thông tin nhân sự!");
    }
  }, [employee, form]);

  const departmentId = form.watch("departmentId");
  const avatarUrl = form.watch("avatar");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isUploading, previewUrl, handleImageUpload } = useImageUpload({
    onSuccess: (fileId) => {
      form.setValue("avatar", fileId);
    }
  });

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  const units = useMemo(() => flattenUnits(Array.isArray(treeNodes) ? treeNodes : []), [treeNodes]);

  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", departmentId],
    queryFn: () => organizationApi.getJobTitles(departmentId!),
    enabled: !!departmentId,
  });

  const { data: rankTitles = [] } = useGetCategoryByGroup("CIVIL_SERVANT_RANK");

  const selectedUnit = units.find(u => u.id === departmentId);
  const jobTitles = jobTitlesRes?.items ?? [];

  const govtTitles = useMemo(() => jobTitles.filter(j => j.type === "GOVERNMENT" || !j.type), [jobTitles]);
  const partyTitles = useMemo(() => jobTitles.filter(j => j.type === "PARTY"), [jobTitles]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const finalJobTitleId = values.jobTitleId || values.civilServantRankId;
      await updateEmployee({
        id: employeeId,
        payload: {
          ...values,
          departmentId: values.departmentId,
          jobTitleId: finalJobTitleId,
          civilServantRankId: values.civilServantRankId,
          partyTitleId: values.partyTitleId || 0,
        }
      });
      toast.success("Cập nhật hồ sơ thành công");
      router.push("/services/hrm/employees");
    } catch {
      toast.error("Lỗi khi lưu dữ liệu");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 md:p-10 text-slate-900">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-[1200px] mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" size="icon" onClick={() => router.back()} className="rounded-full border-slate-300">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <Heading level="h2" className="font-black tracking-tight text-slate-900">Cập nhật hồ sơ nhân sự</Heading>
                <Text variant="small" weight="medium" className="text-slate-500 italic">Thiết lập vị trí và thông tin định danh hệ thống iDesk</Text>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600">Hủy</Button>
              <Button type="submit" disabled={submitting || isUploading || isLoadingEmployee} className="rounded-xl bg-blue-700 hover:bg-blue-800 px-8 h-11 font-bold shadow-lg shadow-blue-200">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                LƯU HỒ SƠ
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CỘT PHẢI: VỊ TRÍ CÔNG TÁC */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-2xl border-slate-300 shadow-md overflow-hidden bg-white ring-1 ring-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-700" />
                    <CardTitle className="text-lg font-bold">Vị trí công tác</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Tìm đơn vị */}
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={() => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-black text-slate-700 text-xs uppercase tracking-wider">1. Tìm đơn vị (Sở/Phòng/Ban) *</FormLabel>
                        <Search placeholder="Gõ tên đơn vị cần tìm..." className="w-full" />
                        <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                          <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                            {units.filter(u => u.fullPath.toLowerCase().includes(searchTerm.toLowerCase())).map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  form.setValue("departmentId", u.id, { shouldValidate: true });
                                  form.setValue("jobTitleId", undefined as any);
                                }}
                                className={cn(
                                  "w-full text-left p-3 rounded-lg mb-1 transition-all border border-transparent",
                                  departmentId === u.id
                                    ? "bg-blue-700 text-white border-blue-800 shadow-md"
                                    : "hover:bg-white hover:border-slate-200 text-slate-700"
                                )}
                              >
                                <div className="font-bold text-[13px]">{u.name}</div>
                                <div className={cn("text-[10px] truncate font-medium", departmentId === u.id ? "text-blue-100" : "text-slate-400")}>
                                  {u.fullPath}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Hiển thị đơn vị đã chọn */}
                  {selectedUnit && (
                    <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg border-l-4 border-blue-500">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 p-1.5 rounded-lg shrink-0"><Check size={16} /></div>
                        <div className="space-y-1">
                          <Text variant="small" className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Đơn vị đã chọn:</Text>
                          <Text weight="bold" className="leading-snug">{selectedUnit.fullPath}</Text>
                          <Text variant="code" className="text-[10px] text-slate-400 italic font-normal bg-transparent p-0">Mã: {selectedUnit.code || 'None'}</Text>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chức danh */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="jobTitleId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="font-black text-slate-700 text-xs uppercase tracking-wider">2. Chức vụ chính quyền (Không bắt buộc)</FormLabel>
                          <Select
                            disabled={!departmentId}
                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                            value={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100">
                                <SelectValue placeholder="-- Chọn chức vụ chính quyền --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {govtTitles.map((j: any) => (
                                <SelectItem key={j.id} value={String(j.id)}>{j.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="civilServantRankId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="font-black text-slate-700 text-xs uppercase tracking-wider">3. Ngạch công chức *</FormLabel>
                          <Select
                            disabled={!departmentId}
                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                            value={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100">
                                <SelectValue placeholder="-- Chọn ngạch công chức --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {rankTitles.map((j: any) => (
                                <SelectItem key={j.id} value={String(j.id)}>{j.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="partyTitleId"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="font-black text-slate-700 text-xs uppercase tracking-wider">4. Chức vụ Đảng (Không bắt buộc)</FormLabel>
                          <Select
                            disabled={!departmentId}
                            onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                            value={field.value ? String(field.value) : undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 disabled:bg-slate-100">
                                <SelectValue placeholder="-- Chọn chức vụ Đảng --" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {partyTitles.map((j: any) => (
                                <SelectItem key={j.id} value={String(j.id)}>{j.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isLoadingJobs && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mt-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Đang tải danh sách chức danh...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="rounded-2xl border-slate-300 shadow-md bg-white ring-1 ring-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-700" />
                    <CardTitle className="text-lg font-bold">Thông tin cá nhân & Tài khoản</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* PHOTO SECTION */}
                    <div className="col-span-full flex items-center gap-6 pb-4 border-b border-slate-100 mb-2">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-24 w-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all cursor-pointer overflow-hidden relative group shrink-0"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-1">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="text-[10px] font-bold text-blue-600 uppercase">Đang tải</span>
                          </div>
                        ) : previewUrl ? (
                          <>
                            <Image src={previewUrl} alt="Avatar" fill unoptimized className="object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={20} className="text-white" />
                            </div>
                          </>
                        ) : avatarUrl ? (
                          <>
                            <Image src={avatarUrl} alt="Avatar" fill unoptimized className="object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Camera size={24} />
                            <span className="text-[10px] font-bold uppercase">Ảnh thẻ</span>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />

                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="font-bold text-slate-700 text-sm">Họ và đệm *</FormLabel>
                              <FormControl>
                                <Input {...field} className="border-slate-300 font-medium" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastname"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="font-bold text-slate-700 text-sm">Tên *</FormLabel>
                              <FormControl>
                                <Input {...field} className="border-slate-300 font-medium" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* CÁC TRƯỜNG NHẬP LIỆU KHÁC */}
                    <FormField
                      control={form.control}
                      name="identityCard"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><CreditCard size={14} /> CCCD/Định danh</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthday"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><Calendar size={14} /> Ngày sinh</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-slate-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><Mail size={14} /> Email liên hệ</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-300" placeholder="user@daklak.gov.vn" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><Phone size={14} /> Số điện thoại</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator className="col-span-full my-2" />

                    <FormField
                      control={form.control}
                      name="employeeCode"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><Hash size={14} /> Mã nhân viên</FormLabel>
                          <FormControl>
                            <Input {...field} className="border-slate-300 font-mono text-sm uppercase" placeholder="HỆ THỐNG TỰ TẠO" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="font-bold text-slate-700 text-sm flex items-center gap-2"><Calendar size={14} /> Ngày gia nhập</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="border-slate-300" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="p-4 rounded-xl bg-slate-900 text-white flex gap-4 items-center shadow-lg ring-1 ring-slate-800">
                <AlertCircle size={24} className="text-blue-500 shrink-0" />
                <Text variant="small" weight="medium" className="leading-relaxed">
                  Hồ sơ nhân sự sẽ được liên kết trực tiếp với <strong>Trục liên thông văn bản (LGSP)</strong> của tỉnh. Vui lòng kiểm tra kỹ thông tin.
                </Text>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}