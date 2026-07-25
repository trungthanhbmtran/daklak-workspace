/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Server, ShieldAlert, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { integrationFormSchema, IntegrationFormValues } from "../../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useCreateIntegration, useUpdateIntegration, IntegrationConfig } from "../../api";
import { toast } from "sonner";

import { BasicInfoFields } from "./form/BasicInfoFields";
import { ProtocolFields } from "./form/ProtocolFields";
import { AuthFields } from "./form/AuthFields";
import { RawConfigFields } from "./form/RawConfigFields";

export interface IntegrationFormModalRef {
  openCreate: (initialData?: any) => void;
  openEdit: (item: IntegrationConfig) => void;
}

export const IntegrationFormModal = forwardRef<IntegrationFormModalRef>((props, ref) => {
  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationConfig | null>(null);

  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      name: "",
      code: "",
      isActive: true,
      protocol: "REST",
      baseUrl: "",
      authType: "NONE",
      authUrl: "",
      apiToken: "",
      clientId: "",
      clientSecret: "",
      isRawMode: false,
      rawConfig: "{}"
    }
  });

  const isRawMode = form.watch("isRawMode");

  useImperativeHandle(ref, () => ({
    openCreate: (initialData?: any) => {
      setEditingItem(null);
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        isActive: true,
        protocol: initialData?.protocol || "REST",
        baseUrl: initialData?.baseUrl || "",
        authType: initialData?.authType || "NONE",
        authUrl: initialData?.authConfig?.authUrl || "",
        apiToken: initialData?.authConfig?.apiToken || "",
        clientId: initialData?.authConfig?.clientId || "",
        clientSecret: initialData?.authConfig?.clientSecret || "",
        isRawMode: !!initialData?.isRawMode,
        rawConfig: initialData?.metadata ? JSON.stringify(initialData.metadata) : "{}"
      });
      setIsOpen(true);
    },
    openEdit: (item: IntegrationConfig) => {
      setEditingItem(item);
      form.reset({
        name: item.name || "",
        code: item.code || "",
        isActive: item.isActive ?? true,
        protocol: item.protocol || "REST",
        baseUrl: item.baseUrl || "",
        authType: item.authType || "NONE",
        authUrl: item.authConfig?.authUrl || "",
        apiToken: item.authConfig?.apiToken || "",
        clientId: item.authConfig?.clientId || "",
        clientSecret: item.authConfig?.clientSecret || "",
        isRawMode: false,
        rawConfig: item.metadata ? JSON.stringify(item.metadata, null, 2) : "{}"
      });
      setIsOpen(true);
    }
  }));

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  const onSubmit = (data: IntegrationFormValues) => {
    let metadataObj: any = {};
    if (data.isRawMode) {
      metadataObj = JSON.parse(data.rawConfig);
    } else {
      try {
        metadataObj = JSON.parse(data.rawConfig || "{}");
      } catch (e) { 
        // ignore
      }
    }

    const payload = {
      name: data.name,
      code: data.code,
      isActive: data.isActive,
      protocol: data.protocol,
      baseUrl: data.baseUrl,
      authType: data.authType,
      authConfig: {
        authUrl: data.authUrl,
        apiToken: data.apiToken,
        clientId: data.clientId,
        clientSecret: data.clientSecret
      },
      metadata: metadataObj
    };

    if (editingItem) {
      updateMutation.mutate({ ...payload, id: editingItem.id }, {
        onSuccess: () => {
          toast.success("Cập nhật thành công");
          handleClose();
        },
        onError: (err: any) => toast.error(err.message || "Lỗi cập nhật")
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Thêm mới thành công");
          handleClose();
        },
        onError: (err: any) => toast.error(err.message || "Lỗi thêm mới")
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={(v) => { if (!v) handleClose(); else setIsOpen(v); }}
      maxWidth="max-w-6xl"
      contentClassName="sm:min-w-[1024px] lg:min-w-[1152px]"
      icon={<Server className="w-6 h-6 text-violet-600" />}
      title={editingItem ? "Cập nhật cấu hình API" : "Thêm mới API Đầu Vào"}
      description="Định nghĩa các thông số kỹ thuật (URL, Cặp Key, Token, Endpoints) để kết nối và xác thực với hệ thống ngoài (LGSP/NDXP)."
      bodyClassName="space-y-6"
      footer={
        <>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>Hủy bỏ</Button>
          <Button type="submit" form="integration-form" className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]" disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending ? "Đang xử lý..." : (editingItem ? "Lưu thay đổi" : "Khởi tạo API")}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form id="integration-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <BasicInfoFields />

          <FormField
            name="isRawMode"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10 space-y-0">
                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-500">
                  <ShieldAlert className="w-5 h-5" />
                  <div>
                    <h4 className="text-sm font-bold">Chế độ Nhập liệu Nâng cao (Raw JSON)</h4>
                    <FormDescription className="text-xs text-amber-700 dark:text-amber-600 opacity-80 mt-0.5">Dành cho kỹ thuật viên khi cần chèn cấu hình JSON phức tạp.</FormDescription>
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {!isRawMode ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <ProtocolFields />
              <AuthFields />
            </div>
          ) : (
            <RawConfigFields />
          )}

          <FormField
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-0">
                <FormLabel className="text-sm font-semibold cursor-pointer">Bật / Tắt kết nối ngay lập tức</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </ResponsiveModal>
  );
});

IntegrationFormModal.displayName = "IntegrationFormModal";
