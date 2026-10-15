/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  User,
  Camera,
  Loader2,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Building2,
  Check,
  Hash,
  ShieldAlert,
  UserCheck,
  MapPin,
  Briefcase,
  Search,
  X,
  BadgeCheck,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { hrmApi, hrmKeys } from "@/features/hrm";
import { organizationApi } from "@/features/system-admin/organization/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useImageUpload } from "@/features/posts/hooks/useImageUpload";

const formSchema = z.object({
  firstname: z.string().min(1, "Vui lòng nhập họ và tên đệm"),
  lastname: z.string().min(1, "Vui lòng nhập tên chính"),
  gender: z.string().optional(),
  employeeCode: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  identityCard: z.string().optional(),
  address: z.string().optional(),
  departmentId: z.number({ message: "Vui lòng chọn cơ quan, đơn vị công tác" }),
  jobTitleId: z.number().optional(),
  partyTitleId: z.number().optional(),
  civilServantRankId: z.number().optional(),
  slotOrder: z.number().optional(),
  startDate: z.string().optional(),
  birthday: z.string().optional(),
  employmentStatus: z.string().optional(),
  avatar: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FlatUnit {
  id: number;
  name: string;
  fullPath: string;
  code: string;
  categoryCode?: string;
  typeCode?: string;
  depth: number;
}

function flattenUnits(nodes: any[], acc: FlatUnit[] = [], parentPath: string = "", depth: number = 0): FlatUnit[] {
  for (const node of nodes || []) {
    const currentPath = parentPath ? `${parentPath} › ${node.name}` : node.name;
    if (node.id != null) {
      acc.push({
        id: node.id,
        name: node.name,
        fullPath: currentPath,
        code: node.code,
        categoryCode: node.categoryCode,
        typeCode: node.typeCode,
        depth,
      });
    }
    flattenUnits(node.children ?? [], acc, currentPath, depth + 1);
  }
  return acc;
}

export function EmployeeCreateClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  // Bộ lọc & tìm kiếm đơn vị cục bộ
  const [unitSearch, setUnitSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "DANG" | "CHINH_QUYEN" | "SU_NGHIEP">("ALL");
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      gender: "male",
      employeeCode: "",
      email: "",
      phone: "",
      identityCard: "",
      address: "",
      departmentId: undefined as any,
      jobTitleId: undefined,
      partyTitleId: undefined,
      civilServantRankId: undefined,
      slotOrder: undefined,
      startDate: new Date().toISOString().slice(0, 10),
      birthday: "",
      employmentStatus: "active",
      avatar: "",
    },
  });

  const { isUploading, previewUrl, handleImageUpload, removeImage } = useImageUpload({
    onSuccess: (fileId) => {
      form.setValue("avatar", fileId);
    },
  });

  const departmentId = form.watch("departmentId");
  const watchedFirstname = form.watch("firstname");
  const watchedLastname = form.watch("lastname");

  // Xem trước họ tên đầy đủ theo thời gian thực
  const fullNamePreview = useMemo(() => {
    const fn = (watchedFirstname || "").trim();
    const ln = (watchedLastname || "").trim();
    if (!fn && !ln) return "";
    return `${ln} ${fn}`.trim().toUpperCase();
  }, [watchedFirstname, watchedLastname]);

  // 1. Tải cây cơ quan/đơn vị từ user-service qua API Gateway
  const { data: treeRes, isLoading: isLoadingTree } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  const rawTree = (treeRes as any)?.data ?? treeRes;
  const units = useMemo(() => flattenUnits(Array.isArray(rawTree) ? rawTree : []), [rawTree]);

  const selectedUnit = useMemo(() => units.find((u) => u.id === departmentId), [units, departmentId]);

  // Bộ lọc đơn vị thông minh
  const filteredUnits = useMemo(() => {
    const q = unitSearch.trim().toLowerCase();
    return units.filter((u) => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.fullPath.toLowerCase().includes(q) ||
        (u.code && u.code.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (categoryFilter === "ALL") return true;
      if (categoryFilter === "DANG") {
        return (
          u.categoryCode === "DANG" ||
          (u.typeCode && u.typeCode.includes("DANG")) ||
          (u.code && (u.code.startsWith("TU_") || u.code.startsWith("BTCTU")))
        );
      }
      if (categoryFilter === "CHINH_QUYEN") {
        return (
          u.categoryCode === "CHINH_QUYEN" ||
          u.categoryCode === "THAM_MUU" ||
          u.typeCode === "SO_NGANH" ||
          u.typeCode === "UBND_TINH"
        );
      }
      if (categoryFilter === "SU_NGHIEP") {
        return (
          u.categoryCode === "SU_NGHIEP" ||
          u.categoryCode === "PHONG_THUOC_SN" ||
          u.typeCode === "TRUNG_TAM"
        );
      }
      return true;
    });
  }, [units, unitSearch, categoryFilter]);

  // 2. Tải danh mục chức danh việc làm khi chọn đơn vị
  const { data: jobTitlesRes, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["organizations", "job-titles", departmentId],
    queryFn: () => organizationApi.getJobTitles(departmentId!),
    enabled: !!departmentId,
  });

  const jobTitles: any[] = jobTitlesRes?.data?.allTitles ?? [];

  const govtTitles = useMemo(
    () => jobTitles.filter((j) => j.type === "GOVERNMENT" || (!j.type && j.type !== "PARTY" && j.type !== "RANK")),
    [jobTitles]
  );
  const partyTitles = useMemo(() => jobTitles.filter((j) => j.type === "PARTY"), [jobTitles]);
  const rankTitles = useMemo(() => jobTitles.filter((j) => j.type === "RANK"), [jobTitles]);

  // Kiểm tra đơn vị thuộc khối Đảng
  const isPartyUnit = useMemo(() => {
    if (!selectedUnit) return false;
    return (
      selectedUnit.categoryCode === "DANG" ||
      selectedUnit.typeCode === "BAN_DANG" ||
      selectedUnit.typeCode === "CQ_DANG" ||
      selectedUnit.typeCode === "PHONG_BAN_DANG" ||
      (selectedUnit.typeCode && selectedUnit.typeCode.includes("DANG")) ||
      (selectedUnit.code && (selectedUnit.code.startsWith("TU_") || selectedUnit.code.startsWith("BTCTU"))) ||
      (selectedUnit.name && selectedUnit.name.toLowerCase().includes("tỉnh ủy")) ||
      (selectedUnit.name && selectedUnit.name.toLowerCase().includes("đảng")) ||
      (partyTitles.length > 0 && govtTitles.length === 0)
    );
  }, [selectedUnit, partyTitles.length, govtTitles.length]);

  // 3. Tải báo cáo định biên VTVL (Staffing Report) của đơn vị
  const { data: staffingReport, isLoading: isLoadingStaffing } = useQuery({
    queryKey: ["staffing-report", departmentId],
    queryFn: () => organizationApi.getStaffingReport(departmentId!),
    enabled: !!departmentId,
    staleTime: 60 * 1000,
  });

  const selectedJobTitleId = form.watch("jobTitleId");
  const selectedPartyTitleId = form.watch("partyTitleId");
  const selectedSlotOrder = form.watch("slotOrder");

  const effectiveJobTitleId = isPartyUnit
    ? selectedPartyTitleId || selectedJobTitleId
    : selectedJobTitleId || selectedPartyTitleId;

  const activeStaffingRow = useMemo(() => {
    if (!effectiveJobTitleId || !staffingReport?.data) return undefined;
    return (staffingReport.data as any[]).find((s: any) => s.jobTitleId === effectiveJobTitleId);
  }, [effectiveJobTitleId, staffingReport]);

  const quotaInfo = activeStaffingRow
    ? {
        quantity: activeStaffingRow.quantity,
        currentCount: activeStaffingRow.currentCount ?? 0,
        slots: activeStaffingRow.slots || [],
      }
    : undefined;

  // Xử lý gửi biểu mẫu
  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const payload: any = {
        firstname: values.firstname.trim(),
        lastname: values.lastname.trim(),
        gender: values.gender || "male",
        employeeCode: values.employeeCode?.trim() || undefined,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        identityCard: values.identityCard?.trim() || undefined,
        address: values.address?.trim() || undefined,
        departmentId: values.departmentId,
        jobTitleId: values.jobTitleId || undefined,
        partyTitleId: values.partyTitleId || undefined,
        civilServantRankId: values.civilServantRankId || undefined,
        slotOrder: values.slotOrder || undefined,
        startDate: values.startDate || undefined,
        birthday: values.birthday || undefined,
        employmentStatus: values.employmentStatus || "active",
        avatar: values.avatar || undefined,
      };

      await hrmApi.create(payload);

      queryClient.invalidateQueries({ queryKey: hrmKeys.employees() });
      if (values.departmentId) {
        queryClient.invalidateQueries({ queryKey: ["staffing-report", values.departmentId] });
      }

      toast.success("Thêm mới hồ sơ nhân sự thành công!", {
        description: `Cán bộ: ${fullNamePreview || values.lastname} (${selectedUnit?.name})`,
      });

      router.push("/services/hrm/employees");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Lỗi khi lưu hồ sơ nhân sự. Vui lòng kiểm tra lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 text-slate-900 font-sans">
      {/* ─── STICKY ENTERPRISE HEADER ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shrink-0"
              title="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-semibold text-blue-700 bg-blue-50 border-blue-200 px-2 py-0.5 rounded-md">
                  HRM & KPI VTVL
                </Badge>
                <span className="text-slate-300">/</span>
                <span className="text-xs text-slate-500 font-medium truncate">Thêm mới nhân sự</span>
              </div>
              <Heading level="h3" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate flex items-center gap-2">
                Tạo mới Hồ sơ Cán bộ & Vị trí việc làm
              </Heading>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={submitting}
              className="h-9 px-4 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl text-sm"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={submitting || isUploading}
              className="h-9 px-5 font-semibold rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white shadow-sm shadow-blue-500/20 text-sm gap-2 transition-all active:scale-98"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Lưu hồ sơ</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT CONTAINER ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ═════════════════════════════════════════════════════════════════════════
                  CỘT TRÁI (7 COLS): THÔNG TIN ĐỊNH DANH & HỒ SƠ CÁ NHÂN
              ═════════════════════════════════════════════════════════════════════════ */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CARD 1: THÔNG TIN ĐỊNH DANH & CÁ NHÂN */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100/80 text-blue-700 font-bold">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900">
                            1. Thông tin cá nhân & Định danh
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-500">
                            Họ tên, ảnh thẻ, căn cước công dân và thông tin liên lạc
                          </CardDescription>
                        </div>
                      </div>
                      {fullNamePreview && (
                        <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          <BadgeCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                          {fullNamePreview}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* KHỐI ẢNH THẺ VÀ HỌ TÊN */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative h-28 w-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 hover:border-blue-500 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-2xs"
                          title="Nhấn để tải lên ảnh thẻ 3x4 hoặc 4x6"
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                                Đang tải...
                              </span>
                            </div>
                          ) : previewUrl ? (
                            <>
                              <Image
                                src={previewUrl}
                                alt="Ảnh thẻ"
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera className="h-6 w-6" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-1 p-3 text-slate-400 group-hover:text-blue-600 transition-colors text-center">
                              <Camera className="h-7 w-7 stroke-1.5" />
                              <span className="text-[11px] font-semibold tracking-tight text-slate-600">
                                Tải ảnh thẻ
                              </span>
                              <span className="text-[9px] text-slate-400">JPG, PNG ≤ 5MB</span>
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

                        {previewUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage();
                              form.setValue("avatar", "");
                            }}
                            className="text-[11px] text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-1 transition-colors"
                          >
                            <X className="h-3 w-3" /> Gỡ ảnh
                          </button>
                        )}
                      </div>

                      {/* Họ & Tên */}
                      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lastname"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                Họ và tên đệm <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ví dụ: Nguyễn Văn"
                                  className="h-10 rounded-xl border-slate-200 bg-white font-medium text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="firstname"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                Tên chính <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Ví dụ: Hải"
                                  className="h-10 rounded-xl border-slate-200 bg-white font-medium text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        {/* Giới tính */}
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-bold text-slate-700">Giới tính</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || "male"}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium">
                                    <SelectValue placeholder="Chọn giới tính" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="male">Nam</SelectItem>
                                  <SelectItem value="female">Nữ</SelectItem>
                                  <SelectItem value="other">Khác</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        {/* Ngày sinh */}
                        <FormField
                          control={form.control}
                          name="birthday"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Ngày sinh
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium"
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* CĂN CƯỚC & LIÊN HỆ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="identityCard"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-slate-500" /> Số CCCD / Định danh cá nhân
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="12 số căn cước công dân"
                                maxLength={12}
                                className="h-10 rounded-xl border-slate-200 bg-white font-mono text-sm focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-500" /> Số điện thoại liên hệ
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="09xx xxx xxx"
                                className="h-10 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 sm:col-span-2">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-500" /> Hòm thư công vụ / Email
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="canbo@daklak.gov.vn hoặc email cá nhân"
                                className="h-10 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5 sm:col-span-2">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-500" /> Địa chỉ thường trú / Nơi ở hiện nay
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Số nhà, đường, phường/xã, TP. Buôn Ma Thuột, tỉnh Đắk Lắk"
                                className="h-10 rounded-xl border-slate-200 bg-white text-sm focus:border-blue-500"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* CARD 2: CHẾ ĐỘ LÀM VIỆC & MÃ HỆ THỐNG */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100/80 text-indigo-700 font-bold">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          2. Chế độ công tác & Thiết lập hồ sơ
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Mã nhân sự hệ thống, ngày gia nhập cơ quan và tình trạng làm việc
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="employeeCode"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 text-slate-500" /> Mã cán bộ / nhân viên
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Để trống hệ thống sẽ tự sinh (E...)"
                                className="h-10 rounded-xl border-slate-200 bg-slate-50/60 font-mono text-sm uppercase focus:bg-white focus:border-blue-500"
                              />
                            </FormControl>
                            <Text variant="small" className="text-[11px] text-slate-400">
                              Mã định danh liên thông các phần mềm quản lý cán bộ
                            </Text>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" /> Ngày tiếp nhận / Bắt đầu công tác
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employmentStatus"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-xs font-bold text-slate-700">Trạng thái công tác</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || "active"}>
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium">
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Đang công tác chính thức</SelectItem>
                                <SelectItem value="probation">Tập sự / Thử việc</SelectItem>
                                <SelectItem value="seconded">Biệt phái / Tăng cường</SelectItem>
                                <SelectItem value="leave">Tạm hoãn / Nghỉ chế độ</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Ngạch công chức/viên chức nếu có */}
                      {rankTitles.length > 0 && (
                        <FormField
                          control={form.control}
                          name="civilServantRankId"
                          render={({ field }) => (
                            <FormItem className="space-y-1.5">
                              <FormLabel className="text-xs font-bold text-slate-700">
                                Ngạch công chức / viên chức
                              </FormLabel>
                              <Select
                                onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                value={field.value ? String(field.value) : undefined}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium">
                                    <SelectValue placeholder="-- Chọn ngạch công chức --" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {rankTitles.map((r: any) => (
                                    <SelectItem key={r.id} value={String(r.id)}>
                                      {r.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* ═════════════════════════════════════════════════════════════════════════
                  CỘT PHẢI (5 COLS): ĐƠN VỊ CÔNG TÁC, CHỨC DANH VTVL & ĐỊNH BIÊN
              ═════════════════════════════════════════════════════════════════════════ */}
              <div className="lg:col-span-5 space-y-6">

                {/* CARD 3: CƠ QUAN & VỊ TRÍ VIỆC LÀM (VTVL) */}
                <Card className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                  <CardHeader className="bg-slate-50/70 border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-xs">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">
                          3. Cơ quan & Vị trí việc làm (VTVL)
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Chọn cơ quan và phân công slot định biên đã phê duyệt
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-5">
                    {/* BƯỚC 1: CHỌN ĐƠN VỊ CÔNG TÁC */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span>1. Đơn vị công tác (Sở / Ban / Phòng)</span>
                          <span className="text-red-500">*</span>
                        </label>
                        {selectedUnit && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsUnitSelectorOpen((prev) => !prev)}
                            className="h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-2 rounded-lg font-medium"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {isUnitSelectorOpen ? "Đóng danh sách" : "Thay đổi đơn vị"}
                          </Button>
                        )}
                      </div>

                      {/* Hiển thị thẻ đơn vị đã chọn */}
                      {selectedUnit && !isUnitSelectorOpen && (
                        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4 shadow-2xs">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                              {isPartyUnit ? <Landmark className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "text-[10px] font-bold px-1.5 py-0 rounded",
                                    isPartyUnit ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                  )}
                                >
                                  {isPartyUnit ? "Khối Cơ quan Đảng" : "Khối Chính quyền / Sự nghiệp"}
                                </Badge>
                                {selectedUnit.code && (
                                  <span className="text-[11px] font-mono font-medium text-slate-500">
                                    [{selectedUnit.code}]
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-bold text-slate-900 mt-1 leading-snug wrap-break-word">
                                {selectedUnit.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5 leading-tight wrap-break-word">
                                {selectedUnit.fullPath}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Danh sách tìm kiếm đơn vị (hiển thị khi chưa chọn hoặc khi bấm Thay đổi) */}
                      {(!selectedUnit || isUnitSelectorOpen) && (
                        <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                          {/* Ô tìm kiếm tức thời */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              value={unitSearch}
                              onChange={(e) => setUnitSearch(e.target.value)}
                              placeholder="Tìm kiếm theo tên hoặc mã đơn vị..."
                              className="pl-9 pr-8 h-9 text-xs rounded-lg border-slate-200 bg-white shadow-2xs focus:bg-white"
                            />
                            {unitSearch && (
                              <button
                                type="button"
                                onClick={() => setUnitSearch("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Bộ lọc loại cơ quan */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
                            <button
                              type="button"
                              onClick={() => setCategoryFilter("ALL")}
                              className={cn(
                                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                                categoryFilter === "ALL"
                                  ? "bg-slate-900 text-white"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              Tất cả ({units.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryFilter("DANG")}
                              className={cn(
                                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                                categoryFilter === "DANG"
                                  ? "bg-red-700 text-white"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              Khối Đảng
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryFilter("CHINH_QUYEN")}
                              className={cn(
                                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                                categoryFilter === "CHINH_QUYEN"
                                  ? "bg-blue-700 text-white"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              Sở / Ngành
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryFilter("SU_NGHIEP")}
                              className={cn(
                                "px-2.5 py-1 rounded-md font-medium shrink-0 transition-colors",
                                categoryFilter === "SU_NGHIEP"
                                  ? "bg-emerald-700 text-white"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                              )}
                            >
                              Đơn vị sự nghiệp
                            </button>
                          </div>

                          {/* Danh sách cuộn chọn đơn vị */}
                          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {isLoadingTree ? (
                              <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Đang tải cây tổ chức...
                              </div>
                            ) : filteredUnits.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">
                                Không tìm thấy đơn vị phù hợp với từ khóa
                              </div>
                            ) : (
                              filteredUnits.map((u) => {
                                const isSelected = departmentId === u.id;
                                const isDang =
                                  u.categoryCode === "DANG" ||
                                  (u.typeCode && u.typeCode.includes("DANG")) ||
                                  (u.code && (u.code.startsWith("TU_") || u.code.startsWith("BTCTU")));

                                return (
                                  <div
                                    key={u.id}
                                    onClick={() => {
                                      form.setValue("departmentId", u.id, { shouldValidate: true });
                                      form.setValue("jobTitleId", undefined);
                                      form.setValue("partyTitleId", undefined);
                                      form.setValue("slotOrder", undefined);
                                      setIsUnitSelectorOpen(false);
                                    }}
                                    className={cn(
                                      "p-2.5 rounded-lg cursor-pointer transition-all border text-left flex items-start gap-2.5 select-none",
                                      isSelected
                                        ? "bg-blue-700 text-white border-blue-800 shadow-xs"
                                        : "bg-white hover:bg-blue-50/60 border-slate-200/80 text-slate-800"
                                    )}
                                  >
                                    <div className="mt-0.5 shrink-0">
                                      {isDang ? (
                                        <Landmark
                                          className={cn(
                                            "h-3.5 w-3.5",
                                            isSelected ? "text-white" : "text-red-600"
                                          )}
                                        />
                                      ) : (
                                        <Building2
                                          className={cn(
                                            "h-3.5 w-3.5",
                                            isSelected ? "text-white" : "text-blue-600"
                                          )}
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 justify-between">
                                        <span className="font-bold text-xs truncate">{u.name}</span>
                                        {u.code && (
                                          <span
                                            className={cn(
                                              "text-[9px] font-mono px-1 py-0 rounded",
                                              isSelected ? "bg-blue-800 text-blue-100" : "bg-slate-100 text-slate-500"
                                            )}
                                          >
                                            {u.code}
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className={cn(
                                          "text-[10px] truncate mt-0.5",
                                          isSelected ? "text-blue-100" : "text-slate-400"
                                        )}
                                      >
                                        {u.fullPath}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                      {form.formState.errors.departmentId && (
                        <p className="text-xs text-red-500 font-medium">
                          {form.formState.errors.departmentId.message}
                        </p>
                      )}
                    </div>

                    <Separator className="bg-slate-100 my-1" />

                    {/* BƯỚC 2: CHỌN CHỨC VỤ / VỊ TRÍ VIỆC LÀM */}
                    <div className="space-y-4">
                      {isPartyUnit ? (
                        <>
                          {/* Chức danh Đảng (bắt buộc đối với Khối Đảng) */}
                          <FormField
                            control={form.control}
                            name="partyTitleId"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                                  <span>2. Chức danh / VTVL Đảng</span>
                                  <span className="text-red-500 font-semibold">* Khối Đảng</span>
                                </FormLabel>
                                <Select
                                  disabled={!departmentId}
                                  onValueChange={(val) => {
                                    field.onChange(val ? Number(val) : undefined);
                                    form.setValue("slotOrder", undefined);
                                  }}
                                  value={field.value ? String(field.value) : undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold focus:border-blue-500">
                                      <SelectValue placeholder="-- Chọn chức vụ khối Đảng --" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {partyTitles.map((j: any) => {
                                      const rep = (staffingReport?.data as any[] || []).find((s: any) => s.jobTitleId === j.id);
                                      const qty = rep ? rep.quantity : null;
                                      const cnt = rep ? rep.currentCount ?? 0 : 0;
                                      const rem = qty !== null ? qty - cnt : null;
                                      return (
                                        <SelectItem key={j.id} value={String(j.id)}>
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <span className="font-medium">{j.name}</span>
                                            {qty !== null && (
                                              <span
                                                className={cn(
                                                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                                  rem !== null && rem <= 0
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                )}
                                              >
                                                Định biên: {cnt}/{qty}
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          {/* Chức vụ chính quyền kiêm nhiệm nếu có */}
                          {govtTitles.length > 0 && (
                            <FormField
                              control={form.control}
                              name="jobTitleId"
                              render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                  <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Chức vụ chính quyền kiêm nhiệm (Không bắt buộc)
                                  </FormLabel>
                                  <Select
                                    disabled={!departmentId}
                                    onValueChange={(val) => field.onChange(val ? Number(val) : undefined)}
                                    value={field.value ? String(field.value) : undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium">
                                        <SelectValue placeholder="-- Chọn chức vụ chính quyền --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {govtTitles.map((j: any) => (
                                        <SelectItem key={j.id} value={String(j.id)}>
                                          {j.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          {/* Chức vụ chính quyền (đơn vị thông thường) */}
                          <FormField
                            control={form.control}
                            name="jobTitleId"
                            render={({ field }) => (
                              <FormItem className="space-y-1.5">
                                <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                                  <span>2. Chức vụ chính quyền</span>
                                  <span className="text-blue-600 font-semibold">Chính quyền / Sở ngành</span>
                                </FormLabel>
                                <Select
                                  disabled={!departmentId}
                                  onValueChange={(val) => {
                                    field.onChange(val ? Number(val) : undefined);
                                    form.setValue("slotOrder", undefined);
                                  }}
                                  value={field.value ? String(field.value) : undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold focus:border-blue-500">
                                      <SelectValue placeholder="-- Chọn chức vụ chính quyền --" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {govtTitles.map((j: any) => {
                                      const rep = (staffingReport?.data as any[] || []).find((s: any) => s.jobTitleId === j.id);
                                      const qty = rep ? rep.quantity : null;
                                      const cnt = rep ? rep.currentCount ?? 0 : 0;
                                      const rem = qty !== null ? qty - cnt : null;
                                      return (
                                        <SelectItem key={j.id} value={String(j.id)}>
                                          <div className="flex items-center justify-between gap-3 w-full">
                                            <span className="font-medium">{j.name}</span>
                                            {qty !== null && (
                                              <span
                                                className={cn(
                                                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
                                                  rem !== null && rem <= 0
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                                )}
                                              >
                                                Định biên: {cnt}/{qty}
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />

                          {/* Chức vụ Đảng kiêm nhiệm */}
                          {partyTitles.length > 0 && (
                            <FormField
                              control={form.control}
                              name="partyTitleId"
                              render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                  <FormLabel className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    Chức vụ Đảng (Không bắt buộc)
                                  </FormLabel>
                                  <Select
                                    disabled={!departmentId}
                                    onValueChange={(val) => {
                                      field.onChange(val ? Number(val) : undefined);
                                      if (!form.getValues("jobTitleId")) form.setValue("slotOrder", undefined);
                                    }}
                                    value={field.value ? String(field.value) : undefined}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white text-sm font-medium">
                                        <SelectValue placeholder="-- Chọn chức vụ Đảng --" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {partyTitles.map((j: any) => (
                                        <SelectItem key={j.id} value={String(j.id)}>
                                          {j.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                        </>
                      )}

                      {/* CHỈ SỐ ĐỊNH BIÊN VTVL */}
                      {quotaInfo !== undefined && (
                        <div
                          className={cn(
                            "flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2.5 rounded-xl border transition-all",
                            quotaInfo.currentCount >= quotaInfo.quantity
                              ? "bg-amber-50/80 text-amber-900 border-amber-200"
                              : "bg-emerald-50/80 text-emerald-900 border-emerald-200"
                          )}
                        >
                          {quotaInfo.currentCount >= quotaInfo.quantity ? (
                            <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          )}
                          <div className="flex-1 leading-snug">
                            <span>Định biên VTVL: </span>
                            <span className="font-bold underline decoration-2">
                              {quotaInfo.currentCount}/{quotaInfo.quantity}
                            </span>
                            <span> &mdash; </span>
                            <span>
                              {quotaInfo.currentCount >= quotaInfo.quantity
                                ? "Đã bố trí đủ chỉ tiêu. Vẫn có thể chọn slot để chuyển giao / bổ nhiệm thay thế."
                                : `Còn ${quotaInfo.quantity - quotaInfo.currentCount} vị trí biên chế sẵn sàng bổ nhiệm.`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* BƯỚC 3: CHỌN VỊ TRÍ (SLOTS) ĐỊNH BIÊN CỤ THỂ */}
                      {activeStaffingRow && activeStaffingRow.quantity > 0 && (
                        <div className="space-y-3 pt-3 border-t border-slate-200/80">
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <UserCheck className="h-4 w-4 text-blue-700" />
                                3. Phân công Slot VTVL ({activeStaffingRow.quantity} vị trí)
                              </FormLabel>
                              <Text variant="small" className="text-[11px] text-slate-500">
                                Nhấp chọn slot phân công cụ thể cho cán bộ
                              </Text>
                            </div>
                            {selectedSlotOrder && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => form.setValue("slotOrder", undefined)}
                                className="text-xs h-7 text-slate-500 hover:text-red-600 px-2 rounded-lg"
                              >
                                Bỏ chọn
                              </Button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                            {Array.from({ length: activeStaffingRow.quantity }, (_, i) => i + 1).map((slotNum) => {
                              const slotData = (activeStaffingRow.slots || []).find((s: any) => s.slotOrder === slotNum);
                              const isAssigned = !!(slotData?.assignedEmployeeCode || slotData?.assignedEmployeeName);
                              const isSelected = selectedSlotOrder === slotNum;

                              return (
                                <div
                                  key={slotNum}
                                  onClick={() => {
                                    form.setValue("slotOrder", isSelected ? undefined : slotNum, { shouldValidate: true });
                                  }}
                                  className={cn(
                                    "p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2 select-none",
                                    isSelected
                                      ? "bg-blue-50/90 border-blue-600 shadow-xs ring-2 ring-blue-600/30 text-blue-950"
                                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                                  )}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1.5">
                                      <span
                                        className={cn(
                                          "flex items-center justify-center h-5 w-5 rounded-md text-[11px] font-bold shrink-0",
                                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                                        )}
                                      >
                                        #{slotNum}
                                      </span>

                                      {isAssigned ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-semibold px-1.5 py-0"
                                        >
                                          Đã có cán bộ
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="bg-emerald-50 text-emerald-800 border-emerald-300 text-[10px] font-semibold px-1.5 py-0"
                                        >
                                          Còn trống
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="text-xs font-bold mt-1.5 truncate">
                                      {slotData?.description ? slotData.description.split(" (")[0] : `Vị trí ${slotNum}`}
                                    </div>

                                    {isAssigned && (
                                      <div className="text-[10px] text-amber-800 font-medium truncate mt-0.5">
                                        CB: <strong>{slotData.assignedEmployeeName || slotData.assignedEmployeeCode}</strong>
                                      </div>
                                    )}
                                  </div>

                                  {slotData?.domains && slotData.domains.length > 0 && (
                                    <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100">
                                      {slotData.domains.map((d: any) => (
                                        <span
                                          key={d.id}
                                          className="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-normal"
                                        >
                                          {d.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {isLoadingJobs && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium py-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải danh sách chức danh...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* CARD 4: THÔNG TIN ĐỒNG BỘ LIÊN THÔNG (ENTERPRISE CALLOUT) */}
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-slate-50 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Liên thông & Tích hợp Dữ liệu
                    </span>
                  </div>
                  <Text variant="small" className="text-xs leading-relaxed text-slate-600">
                    Hồ sơ nhân sự sau khi tạo sẽ được liên kết trực tiếp với <strong>Trục liên thông văn bản (LGSP)</strong>, hệ thống định danh người dùng <strong>user-service</strong> và cơ chế phân quyền dựa trên chính sách <strong>PBAC</strong> của tỉnh Đắk Lắk.
                  </Text>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Tự động đồng bộ VTVL
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-emerald-600" /> Chuẩn hóa Nghị định 30
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}