/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Server, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useCreateIntegration, useUpdateIntegration, IntegrationConfig } from "../../api";
import { toast } from "sonner";

export interface IntegrationFormModalRef {
  openCreate: (initialData?: any) => void;
  openEdit: (item: IntegrationConfig) => void;
}

export const IntegrationFormModal = forwardRef<IntegrationFormModalRef>((props, ref) => {
  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();

  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IntegrationConfig | null>(null);

  const [formData, setFormData] = useState({
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
    rawConfig: "{}"
  });
  const [isRawMode, setIsRawMode] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreate: (initialData?: any) => {
      setEditingItem(null);
      setFormData({
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
        rawConfig: initialData?.metadata ? JSON.stringify(initialData.metadata) : "{}"
      });
      setIsRawMode(!!initialData?.isRawMode);
      setIsOpen(true);
    },
    openEdit: (item: IntegrationConfig) => {
      setEditingItem(item);
      setFormData({
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
        rawConfig: item.metadata ? JSON.stringify(item.metadata) : "{}"
      });
      setIsRawMode(false);
      setIsOpen(true);
    }
  }));

  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast.error("Vui lòng nhập Tên hệ thống và Mã tích hợp");
      return;
    }

    let metadataObj: any = {};
    if (isRawMode) {
      try {
        metadataObj = JSON.parse(formData.rawConfig);
       
      } catch (e) {
        toast.error((e as any)?.response?.data?.message || "Cấu hình JSON không hợp lệ");
        return;
      }
    } else {
      try {
        metadataObj = JSON.parse(formData.rawConfig || "{}");
      // eslint-disable-next-line unused-imports/no-unused-vars
      } catch (e) { }
    }

    const payload = {
      name: formData.name,
      code: formData.code,
      isActive: formData.isActive,
      protocol: formData.protocol,
      baseUrl: formData.baseUrl,
      authType: formData.authType,
      authConfig: {
        authUrl: formData.authUrl,
        apiToken: formData.apiToken,
        clientId: formData.clientId,
        clientSecret: formData.clientSecret
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

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={setIsOpen}
      maxWidth="max-w-5xl"
      icon={<Server className="w-6 h-6 text-violet-600" />}
      title={editingItem ? "Cập nhật cấu hình API" : "Thêm mới API Đầu Vào"}
      description="Định nghĩa các thông số kỹ thuật (URL, Cặp Key, Token, Endpoints) để kết nối và xác thực với hệ thống ngoài (LGSP/NDXP)."
      bodyClassName="space-y-6"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Hủy bỏ</Button>
          <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : (editingItem ? "Lưu thay đổi" : "Khởi tạo API")}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Tên Hệ thống đối tác <span className="text-red-500">*</span></Label>
          <Input
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Vd: Hệ thống LGSP Tỉnh..."
          />
        </div>
        <div className="space-y-2">
          <Label>Mã tích hợp (Integration Code) <span className="text-red-500">*</span></Label>
          <Input
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="Vd: LGSP_HCM"
            className="font-mono uppercase"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
        <div className="flex items-center gap-3 text-amber-800 dark:text-amber-500">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <h4 className="text-sm font-bold">Chế độ Nhập liệu Nâng cao (Raw JSON)</h4>
            <p className="text-xs opacity-80 mt-0.5">Dành cho kỹ thuật viên khi cần chèn cấu hình JSON phức tạp.</p>
          </div>
        </div>
        <Switch checked={isRawMode} onCheckedChange={setIsRawMode} />
      </div>

      {!isRawMode ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Giao thức (Protocol)</Label>
              <Select value={formData.protocol} onValueChange={(val) => setFormData({ ...formData, protocol: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giao thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REST">REST API</SelectItem>
                  <SelectItem value="SOAP">SOAP / WSDL</SelectItem>
                  <SelectItem value="GRAPHQL">GraphQL</SelectItem>
                  <SelectItem value="GRPC">gRPC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URL Máy chủ (Base URL)</Label>
              <Input
                value={formData.baseUrl}
                onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 text-violet-800 dark:text-violet-400 font-semibold border-b border-violet-100 dark:border-violet-900/50 pb-2">
                <KeyRound className="w-4 h-4" />
                Thông tin Xác thực (Authentication)
              </div>
            </div>
            <div className="space-y-2">
              <Label>Loại xác thực</Label>
              <Select value={formData.authType} onValueChange={(val) => setFormData({ ...formData, authType: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại xác thực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Không xác thực</SelectItem>
                  <SelectItem value="BASIC">Basic Auth</SelectItem>
                  <SelectItem value="BEARER">Bearer Token</SelectItem>
                  <SelectItem value="OAUTH2">OAuth 2.0</SelectItem>
                  <SelectItem value="API_KEY">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authType === 'OAUTH2' && (
              <div className="space-y-2">
                <Label>URL lấy Token (Auth URL)</Label>
                <Input
                  value={formData.authUrl}
                  onChange={e => setFormData({ ...formData, authUrl: e.target.value })}
                  placeholder="https://sso.example.com/token"
                  className="font-mono bg-white dark:bg-slate-950"
                />
              </div>
            )}

            {formData.authType === 'BEARER' && (
              <div className="space-y-2">
                <Label>API Bearer Token (Nếu dùng Token tĩnh)</Label>
                <Input
                  type="password"
                  value={formData.apiToken}
                  onChange={e => setFormData({ ...formData, apiToken: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  className="font-mono bg-white dark:bg-slate-950"
                />
              </div>
            )}

            {(formData.authType === 'BASIC' || formData.authType === 'OAUTH2' || formData.authType === 'API_KEY') && (
              <div className="space-y-2">
                <Label>{formData.authType === 'BASIC' ? 'Username' : 'Client ID (App Key)'}</Label>
                <Input
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  className="font-mono bg-white dark:bg-slate-950"
                />
              </div>
            )}

            {(formData.authType === 'BASIC' || formData.authType === 'OAUTH2') && (
              <div className="space-y-2">
                <Label>{formData.authType === 'BASIC' ? 'Password' : 'Client Secret (App Secret)'}</Label>
                <Input
                  type="password"
                  value={formData.clientSecret}
                  onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
                  className="font-mono bg-white dark:bg-slate-950"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200 h-[400px]">
          <Label>JSON Configuration Data</Label>
          <Textarea
            className="h-full font-mono text-sm p-4 bg-slate-900 text-slate-300 rounded-xl resize-none"
            value={formData.rawConfig}
            onChange={(e) => setFormData({ ...formData, rawConfig: e.target.value })}
            spellCheck={false}
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <Label className="text-sm font-semibold">Bật / Tắt kết nối ngay lập tức</Label>
        <Switch checked={formData.isActive} onCheckedChange={v => setFormData({ ...formData, isActive: v })} />
      </div>
    </ResponsiveModal>
  );
});

IntegrationFormModal.displayName = "IntegrationFormModal";
