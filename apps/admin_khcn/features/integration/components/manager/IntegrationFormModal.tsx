"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Server, ShieldAlert, Plus, Trash2, KeyRound, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    systemName: "",
    integrationCode: "",
    isActive: true,
    type: "LGSP",
    apiUrl: "",
    authUrl: "",
    apiToken: "",
    clientId: "",
    clientSecret: "",
    rawConfig: "{}"
  });
  const [endpoints, setEndpoints] = useState<Array<{ path: string, method: string, description: string }>>([]);
  const [isRawMode, setIsRawMode] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreate: (initialData?: any) => {
      setEditingItem(null);
      setFormData({
        systemName: initialData?.systemName || "",
        integrationCode: initialData?.integrationCode || "",
        isActive: true,
        type: initialData?.type || "LGSP",
        apiUrl: initialData?.apiUrl || "",
        authUrl: initialData?.authUrl || "",
        apiToken: initialData?.apiToken || "",
        clientId: initialData?.clientId || "",
        clientSecret: initialData?.clientSecret || "",
        rawConfig: initialData?.rawConfig || "{}"
      });
      setEndpoints(initialData?.endpoints || []);
      setIsRawMode(!!initialData?.isRawMode);
      setIsOpen(true);
    },
    openEdit: (item: IntegrationConfig) => {
      setEditingItem(item);
      let parsedConfig: any = {};
      try {
        parsedConfig = JSON.parse(item.configData || "{}");
      } catch (e) {
        console.error("Lỗi parse configData:", e);
      }
      setFormData({
        systemName: item.systemName || "",
        integrationCode: item.integrationCode || "",
        isActive: item.isActive ?? true,
        type: parsedConfig.type || "LGSP",
        apiUrl: parsedConfig.apiUrl || "",
        authUrl: parsedConfig.authUrl || "",
        apiToken: parsedConfig.apiToken || "",
        clientId: parsedConfig.keys?.clientId || "",
        clientSecret: parsedConfig.keys?.clientSecret || "",
        rawConfig: item.configData || "{}"
      });
      setEndpoints(parsedConfig.endpoints || []);
      setIsRawMode(false);
      setIsOpen(true);
    }
  }));

  const handleClose = () => setIsOpen(false);

  const handleSave = () => {
    if (!formData.systemName || !formData.integrationCode) {
      toast.error("Vui lòng nhập Tên hệ thống và Mã tích hợp");
      return;
    }

    let configDataString = "";
    if (isRawMode) {
      configDataString = formData.rawConfig;
      // Validate JSON
      try {
        JSON.parse(configDataString);
      } catch (e) {
        toast.error("Cấu hình JSON không hợp lệ");
        return;
      }
    } else {
      let parsedRaw: any = {};
      try {
        parsedRaw = JSON.parse(formData.rawConfig || "{}");
      } catch (e) { }

      configDataString = JSON.stringify({
        ...parsedRaw,
        type: formData.type,
        apiUrl: formData.apiUrl,
        authUrl: formData.authUrl,
        apiToken: formData.apiToken,
        keys: {
          clientId: formData.clientId,
          clientSecret: formData.clientSecret
        },
        endpoints: endpoints
      });
    }

    const payload = {
      systemName: formData.systemName,
      integrationCode: formData.integrationCode,
      isActive: formData.isActive,
      configData: configDataString
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-full max-h-[85vh] flex flex-col">

          <DialogHeader className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Server className="w-6 h-6 text-violet-600" />
              {editingItem ? "Cập nhật cấu hình API" : "Thêm mới API Đầu Vào"}
            </DialogTitle>
            <DialogDescription>
              Định nghĩa các thông số kỹ thuật (URL, Cặp Key, Token, Endpoints) để kết nối và xác thực với hệ thống ngoài (LGSP/NDXP).
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tên Hệ thống đối tác <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.systemName}
                  onChange={e => setFormData({ ...formData, systemName: e.target.value })}
                  placeholder="Vd: Hệ thống LGSP Tỉnh..."
                />
              </div>
              <div className="space-y-2">
                <Label>Mã tích hợp (Integration Code) <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.integrationCode}
                  onChange={e => setFormData({ ...formData, integrationCode: e.target.value.toUpperCase() })}
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
                    <Label>Loại kết nối (Type)</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại kết nối" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LGSP">Trục liên thông (LGSP)</SelectItem>
                        <SelectItem value="WEBHOOK">Webhook (Pull/Push)</SelectItem>
                        <SelectItem value="POSTMAN">Bộ sưu tập Postman</SelectItem>
                        <SelectItem value="SYSTEM">Hệ thống nội bộ (SYSTEM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>URL Máy chủ (API Endpoint)</Label>
                    <Input
                      value={formData.apiUrl}
                      onChange={e => setFormData({ ...formData, apiUrl: e.target.value })}
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
                    <Label>URL lấy Token (Auth URL)</Label>
                    <Input
                      value={formData.authUrl}
                      onChange={e => setFormData({ ...formData, authUrl: e.target.value })}
                      placeholder="https://sso.example.com/token"
                      className="font-mono bg-white dark:bg-slate-950"
                    />
                  </div>
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
                  <div className="space-y-2">
                    <Label>Client ID (App Key)</Label>
                    <Input
                      value={formData.clientId}
                      onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                      className="font-mono bg-white dark:bg-slate-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret (App Secret)</Label>
                    <Input
                      type="password"
                      value={formData.clientSecret}
                      onChange={e => setFormData({ ...formData, clientSecret: e.target.value })}
                      className="font-mono bg-white dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold">
                      <LinkIcon className="w-4 h-4" />
                      Danh sách Endpoints
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEndpoints([...endpoints, { path: '', method: 'GET', description: '' }])}
                      className="h-8"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Thêm Endpoint
                    </Button>
                  </div>

                  {endpoints.length === 0 ? (
                    <div className="text-center py-6 text-sm text-slate-500 italic">Chưa có endpoint nào. Hãy thêm các endpoint sẽ sử dụng chung bộ key xác thực này.</div>
                  ) : (
                    <div className="space-y-3">
                      {endpoints.map((ep, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Select
                            value={ep.method}
                            onValueChange={(val) => {
                              const newEps = [...endpoints];
                              newEps[idx].method = val;
                              setEndpoints(newEps);
                            }}
                          >
                            <SelectTrigger className="w-[100px] shrink-0 font-mono bg-white dark:bg-slate-950">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            value={ep.path}
                            onChange={(e) => {
                              const newEps = [...endpoints];
                              newEps[idx].path = e.target.value;
                              setEndpoints(newEps);
                            }}
                            placeholder="/api/v1/resource..."
                            className="flex-1 font-mono bg-white dark:bg-slate-950"
                          />

                          <Input
                            value={ep.description}
                            onChange={(e) => {
                              const newEps = [...endpoints];
                              newEps[idx].description = e.target.value;
                              setEndpoints(newEps);
                            }}
                            placeholder="Mô tả endpoint..."
                            className="flex-1 bg-white dark:bg-slate-950"
                          />

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newEps = [...endpoints];
                              newEps.splice(idx, 1);
                              setEndpoints(newEps);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200 h-64">
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

          </div>

          <DialogFooter className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
            <Button variant="outline" onClick={handleClose}>Hủy bỏ</Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : (editingItem ? "Lưu thay đổi" : "Khởi tạo API")}
            </Button>
          </DialogFooter>

        </div>
      </DialogContent>
    </Dialog>
  );
});

IntegrationFormModal.displayName = "IntegrationFormModal";
