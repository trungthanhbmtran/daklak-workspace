/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Server, ShieldAlert, Loader2, List, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { integrationFormSchema, IntegrationFormValues } from "../../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  const [parsedEndpointCount, setParsedEndpointCount] = useState(0);

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
      scope: "",
      tokenPath: "access_token",
      isRawMode: false,
      rawConfig: "{}"
    }
  });

  const isRawMode = form.watch("isRawMode");

  useImperativeHandle(ref, () => ({
    openCreate: (initialData?: any) => {
      setEditingItem(null);
      // Extract parsed endpoints count from rawConfig
      let endpointCount = 0;
      try {
        if (initialData?.rawConfig) {
          const parsed = JSON.parse(initialData.rawConfig);
          endpointCount = parsed._parsedEndpoints?.length || 0;
        }
      } catch { /* ignore */ }
      setParsedEndpointCount(endpointCount);

      form.reset({
        name: initialData?.name || initialData?.systemName || "",
        code: initialData?.code || initialData?.integrationCode || "",
        isActive: true,
        protocol: initialData?.protocol || "REST",
        baseUrl: initialData?.baseUrl || initialData?.apiUrl || "",
        authType: (initialData?.authType || "NONE").toUpperCase(),
        authUrl: initialData?.authConfig?.authUrl || "",
        apiToken: initialData?.authConfig?.apiToken || "",
        clientId: initialData?.authConfig?.clientId || "",
        clientSecret: initialData?.authConfig?.clientSecret || "",
        scope: initialData?.authConfig?.scope || "",
        tokenPath: initialData?.authConfig?.tokenPath || "access_token",
        isRawMode: !!initialData?.isRawMode,
        rawConfig: initialData?.rawConfig || (initialData?.metadata ? JSON.stringify(initialData.metadata, null, 2) : "{}")
      });
      setIsOpen(true);
    },
    openEdit: (item: IntegrationConfig) => {
      setEditingItem(item);
      setParsedEndpointCount(item.metadata?._parsedEndpoints?.length || item.endpoints?.length || 0);
      form.reset({
        name: item.name || "",
        code: item.code || "",
        isActive: item.isActive ?? true,
        protocol: item.protocol || "REST",
        baseUrl: item.baseUrl || "",
        authType: (item.authType || "NONE").toUpperCase(),
        authUrl: item.authConfig?.authUrl || "",
        apiToken: item.authConfig?.apiToken || "",
        clientId: item.authConfig?.clientId || "",
        clientSecret: item.authConfig?.clientSecret || "",
        scope: item.authConfig?.scope || "",
        tokenPath: item.authConfig?.tokenPath || "access_token",
        isRawMode: false,
        rawConfig: item.metadata ? JSON.stringify(item.metadata, null, 2) : "{}"
      });
      setIsOpen(true);
    }
  }));

  const handleClose = () => {
    setIsOpen(false);
    setParsedEndpointCount(0);
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
        clientSecret: data.clientSecret,
        scope: data.scope,
        tokenPath: data.tokenPath
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
      maxWidth="max-w-4xl"
      contentClassName="w-[95vw] max-h-[90vh]"
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
              {parsedEndpointCount > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Đã trích xuất Endpoints</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-0.5">
                      Hệ thống đã tìm thấy <strong>{parsedEndpointCount}</strong> API endpoints từ file import.
                      Sau khi lưu, bạn có thể quản lý chi tiết qua nút <List className="w-3 h-3 inline" /> trên thẻ tích hợp.
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-mono text-sm shrink-0">
                    {parsedEndpointCount} APIs
                  </Badge>
                </div>
              )}
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
