/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Key, UserCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { roleApi } from "@/features/system-admin/roles/api";
import { roleKeys } from "@/features/system-admin/roles/keys";
import { useInvalidateHrmEmployees } from "@/features/hrm";
import { useCreateUser } from "../hooks/useUserApi";

import { HrmLookupSection } from "./create-user/HrmLookupSection";
import { AccountInfoSection } from "./create-user/AccountInfoSection";
import { PbacRolesSection } from "./create-user/PbacRolesSection";

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
  const invalidateHrmEmployees = useInvalidateHrmEmployees();

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => roleApi.getRoles(),
    enabled: isOpen,
  });

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
    }
  }, [isOpen, form]);

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
                <HrmLookupSection isOpen={isOpen} />
                <AccountInfoSection />
                <PbacRolesSection roles={roles} rolesLoading={rolesLoading} />
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
