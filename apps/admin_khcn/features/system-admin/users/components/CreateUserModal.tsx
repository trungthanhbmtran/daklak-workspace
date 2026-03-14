"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck, Key, UserCircle2, Search, Building2, BadgeCheck, Info, UserCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { roleApi } from "@/features/system-admin/roles/api";
import { roleKeys } from "@/features/system-admin/roles/keys";
import { organizationApi } from "@/features/system-admin/organization/api";
import {
  useHrmEmployeesSearch,
  useInvalidateHrmEmployees,
  type HrmEmployee,
} from "@/features/hrm";
import { useCreateUser } from "../hooks/useUserApi";

function flattenUnitNodes(nodes: any[], acc: { id: number; name: string }[] = []): { id: number; name: string }[] {
  for (const n of nodes || []) {
    acc.push({ id: n.id, name: n.name ?? "" });
    flattenUnitNodes(n.children ?? [], acc);
  }
  return acc;
}

// ==========================================
// Schema & types
// ==========================================

const createUserSchema = z.object({
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().min(1, "Email không được để trống").email("Email không hợp lệ"),
  username: z.string().min(1, "Tên đăng nhập không được để trống").min(3, "Tối thiểu 3 ký tự"),
  password: z.string().optional(),
  roleIds: z.array(z.number()),
  cccd: z.string().optional(),
  employeeCode: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function CreateUserModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createUser = useCreateUser();
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
    enabled: isOpen,
  });

  const [hrmKeyword, setHrmKeyword] = useState("");
  // Thêm state để lưu thông tin nhân sự HRM đã được chọn
  const [selectedHrmEmp, setSelectedHrmEmp] = useState<HrmEmployee | null>(null);

  const invalidateHrmEmployees = useInvalidateHrmEmployees();
  const { data: hrmEmployees = [], isLoading: hrmSearching, isFetching: hrmFetching } = useHrmEmployeesSearch(
    hrmKeyword,
    { enabled: isOpen, minChars: 2 }
  );

  const { data: treeNodes } = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    enabled: isOpen,
  });
  
  const { data: jobTitlesRes } = useQuery({
    queryKey: ["organizations", "job-titles"],
    queryFn: () => organizationApi.getJobTitles(),
    enabled: isOpen,
  });

  const unitNameMap = useMemo(() => {
    const m = new Map<number, string>();
    if (!Array.isArray(treeNodes)) return m;
    flattenUnitNodes(treeNodes).forEach((u) => m.set(u.id, u.name));
    return m;
  }, [treeNodes]);

  const jobTitleNameMap = useMemo(() => {
    const m = new Map<number, string>();
    (jobTitlesRes?.items ?? []).forEach((j: { id: number; name: string }) => m.set(j.id, j.name));
    return m;
  }, [jobTitlesRes]);

  const getUnitName = (emp: HrmEmployee) =>
    emp.department?.name || (emp.departmentId != null ? unitNameMap.get(emp.departmentId) : null) || "";
  const getJobTitleName = (emp: HrmEmployee) =>
    emp.jobTitle?.name || (emp.jobTitleId != null ? jobTitleNameMap.get(emp.jobTitleId) : null) || "";

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      username: "",
      password: "",
      roleIds: [] as number[],
      cccd: "",
      employeeCode: "",
    },
  });

  // Reset toàn bộ state khi mở/đóng Modal
  useEffect(() => {
    if (isOpen) {
      form.reset({
        fullName: "",
        phoneNumber: "",
        email: "",
        username: "",
        password: "",
        roleIds: [],
        cccd: "",
        employeeCode: "",
      });
      setHrmKeyword("");
      setSelectedHrmEmp(null);
    }
  }, [isOpen, form]);

  const fillFromHrm = (emp: HrmEmployee) => {
    const fullName = [emp.firstname, emp.lastname].filter(Boolean).join(" ").trim() || undefined;
    form.setValue("fullName", fullName ?? "");
    form.setValue("phoneNumber", emp.phone ?? "");
    form.setValue("email", emp.email || form.getValues("email"));
    form.setValue("cccd", emp.identityCard ?? "");
    form.setValue("employeeCode", emp.employeeCode ?? "");
    
    // Gợi ý username từ mã nhân viên nếu chưa có
    if (!form.getValues("username") && emp.employeeCode) {
      form.setValue("username", emp.employeeCode);
    }
    
    // Lưu lại nhân sự đã chọn để đổi giao diện
    setSelectedHrmEmp(emp);
  };

  const handleClearHrmSelection = () => {
    setSelectedHrmEmp(null);
    setHrmKeyword("");
    // Có thể xóa trống các trường đã fill từ HRM nếu muốn, ở đây giữ lại fullName/email để người dùng đỡ phải nhập lại nếu họ chỉ lỡ bấm nhầm nút
    form.setValue("cccd", "");
    form.setValue("employeeCode", "");
  };

  const onSubmit = (values: CreateUserFormValues) => {
    createUser.mutate(
      {
        email: values.email,
        username: values.username,
        password: values.password || undefined,
        fullName: values.fullName || undefined,
        phoneNumber: values.phoneNumber || undefined,
        roleIds: values.roleIds.length ? values.roleIds : undefined,
        cccd: values.cccd || undefined,
        employeeCode: values.employeeCode || undefined,
      },
      {
        onSuccess: () => {
          invalidateHrmEmployees();
          onClose();
        },
      }
    );
  };

  const isSaving = createUser.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden shadow-xl border-primary/20">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-primary" /> Thêm người dùng mới
          </DialogTitle>
          <DialogDescription>
            Thiết lập thông tin tài khoản và cấu hình chính sách truy cập (PBAC).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[75vh]">
            <ScrollArea className="px-6 py-4 flex-1 bg-background">
              <div className="space-y-8 pb-4">
                
                {/* 1. Tra cứu từ HRM */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">1. Liên kết hồ sơ nhân sự (HRM)</h3>
                    </div>
                  </div>

                  {selectedHrmEmp ? (
                    // Trạng thái: Đã chọn nhân sự
                    <div className="relative p-4 rounded-lg border-2 border-primary/40 bg-primary/5 flex items-start gap-4 transition-all">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <h4 className="font-semibold text-primary truncate">
                          {[selectedHrmEmp.firstname, selectedHrmEmp.lastname].filter(Boolean).join(" ")}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {selectedHrmEmp.identityCard && <span>CCCD: <strong className="font-mono text-foreground">{selectedHrmEmp.identityCard}</strong></span>}
                          {selectedHrmEmp.employeeCode && <span>Mã NV: <strong className="font-mono text-foreground">{selectedHrmEmp.employeeCode}</strong></span>}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getUnitName(selectedHrmEmp)} {getJobTitleName(selectedHrmEmp) && `- ${getJobTitleName(selectedHrmEmp)}`}
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearHrmSelection}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 px-2"
                        title="Hủy chọn nhân sự này"
                      >
                        <X className="h-4 w-4 mr-1" /> Bỏ chọn
                      </Button>
                    </div>
                  ) : (
                    // Trạng thái: Đang tìm kiếm
                    <div className="space-y-3">
                      <FormDescription className="text-xs">
                        Tra cứu cán bộ để tự động điền thông tin (CCCD, Mã số, Email...). Bỏ qua bước này nếu là người dùng ngoài hệ thống.
                      </FormDescription>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập tên, CCCD hoặc mã số điện tử..."
                          value={hrmKeyword}
                          onChange={(e) => setHrmKeyword(e.target.value)}
                          className="flex-1 bg-muted/20"
                        />
                        <Button type="button" variant="secondary" disabled={hrmKeyword.trim().length < 2 || hrmFetching}>
                          {(hrmSearching || hrmFetching) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 sm:mr-2" />}
                          <span className="hidden sm:inline">Tìm kiếm</span>
                        </Button>
                      </div>
                      
                      {/* Kết quả tìm kiếm HRM */}
                      {hrmKeyword.trim().length >= 2 && hrmEmployees.length > 0 && (
                        <div className="rounded-md border bg-card max-h-[220px] overflow-y-auto shadow-md">
                          {hrmEmployees.map((emp) => (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => fillFromHrm(emp)}
                              className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-primary/5 border-b last:border-b-0 transition-colors group"
                            >
                              <BadgeCheck className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                              <div className="min-w-0 flex-1 space-y-1">
                                <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                                  {[emp.firstname, emp.lastname].filter(Boolean).join(" ")}
                                </p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                  <span>CCCD: <strong className="font-medium text-foreground/80">{emp.identityCard || "—"}</strong></span>
                                  <span>Mã: <strong className="font-medium text-foreground/80">{emp.employeeCode || "—"}</strong></span>
                                  {getUnitName(emp) && <span>Phòng ban: <strong className="font-medium text-foreground/80">{getUnitName(emp)}</strong></span>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* 2. Thông tin cá nhân & Tài khoản */}
                {/* ... (Phần 2 và 3 giữ nguyên như code trước đó) ... */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <UserCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">2. Thông tin tài khoản</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl><Input placeholder="Nguyễn Văn A" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl><Input placeholder="0901234567" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input type="email" placeholder="user@domain.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên đăng nhập <span className="text-destructive">*</span></FormLabel>
                        <FormControl><Input placeholder="nguyenvana" {...field} className="font-mono bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl><Input type="password" placeholder="Để trống nếu muốn hệ thống tạo ngẫu nhiên" {...field} value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* 3. Phân quyền PBAC */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">3. Cấu hình vai trò & Chính sách (PBAC)</h3>
                  </div>
                  
                  <div className="bg-primary/5 text-primary-foreground border border-primary/20 rounded-md p-3 flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Trong hệ thống PBAC, quyền hạn được quyết định bởi <strong>Chính sách (Policies)</strong>. 
                      Việc gán Vai trò (Role) dưới đây sẽ tự động kế thừa các tập chính sách đã được liên kết với Vai trò đó.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="roleIds"
                    render={({ field }) => (
                      <FormItem>
                        {rolesLoading ? (
                          <div className="flex items-center justify-center p-6 border rounded-md border-dashed">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" /> 
                            <span className="text-sm text-muted-foreground">Đang tải cấu hình Roles...</span>
                          </div>
                        ) : roles.length === 0 ? (
                          <div className="p-4 text-center border rounded-md text-sm text-muted-foreground bg-muted/20">
                            Chưa có vai trò nào trong hệ thống. Vui lòng thiết lập Roles trước.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] overflow-y-auto p-1">
                            {roles.map((role) => {
                              const isSelected = field.value?.includes(role.id);
                              return (
                                <label
                                  key={role.id}
                                  className={cn(
                                    "relative flex items-start gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200",
                                    isSelected 
                                      ? "bg-primary/5 border-primary shadow-sm" 
                                      : "bg-card border-border hover:border-primary/40 hover:bg-muted/50"
                                  )}
                                >
                                  <FormControl className="mt-0.5">
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          field.onChange([...field.value, role.id]);
                                        } else {
                                          field.onChange(field.value?.filter((id) => id !== role.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className={cn("font-medium text-sm block truncate", isSelected && "text-primary")}>
                                        {role.name}
                                      </span>
                                    </div>
                                    {role.code && (
                                      <Badge variant="outline" className="font-mono text-[10px] px-1.5 bg-background">
                                        {role.code}
                                      </Badge>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>
              </div>
            </ScrollArea>

            <DialogFooter className="px-6 py-4 border-t bg-muted/30 shrink-0">
              <Button type="button" variant="outline" onClick={onClose} className="min-w-[100px]" disabled={isSaving}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={isSaving} className="min-w-[160px]">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
                {isSaving ? "Đang xử lý..." : "Lưu người dùng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
