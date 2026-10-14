/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertCircle, Key, Server, Lock, UserCheck, Save } from "lucide-react";
import { useLgspConfig, useDocuments } from "../hooks/useDocuments";

interface LgspConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LgspConfigModal({ open, onOpenChange }: LgspConfigModalProps) {
  const { data: config, isLoading } = useLgspConfig();
  const { updateLgspConfig } = useDocuments();

  const [systemCode, setSystemCode] = useState("0400101394-CTDL-012");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      if (config.systemCode) setSystemCode(config.systemCode);
    }
  }, [config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateLgspConfig({
        systemCode,
        clientId: clientId || undefined,
        clientSecret: clientSecret || undefined,
        username: username || undefined,
        password: password || undefined,
      });
      onOpenChange(false);
    } catch {
      // Error handled by hook toast
    } finally {
      setIsSaving(false);
    }
  };

  const isConfigured = config?.isConfigured;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-6 rounded-3xl bg-background border shadow-2xl">
        <DialogHeader className="space-y-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black">Cấu hình Trục Liên thông LGSP</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Nền tảng quản lý văn bản, công việc tỉnh Đắk Lắk
                </DialogDescription>
              </div>
            </div>
            {isConfigured ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold px-3 py-1 gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Sẵn sàng
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 font-bold px-3 py-1 gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Chờ Secret Key
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5 py-3">
          {/* Thông tin cố định */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Mã trung tâm liên thông (SystemCode)
            </Label>
            <div className="relative">
              <Input
                value={systemCode}
                onChange={(e) => setSystemCode(e.target.value)}
                className="font-mono font-bold bg-muted/40 rounded-xl"
                placeholder="0400101394-CTDL-012"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mã định danh hệ thống được chỉ định: <strong className="text-foreground">0400101394-CTDL-012</strong>.
            </p>
          </div>

          {/* Cặp key bí mật liên thông */}
          <div className="p-4 bg-muted/20 border border-border/60 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
              <Key className="h-4 w-4 text-blue-600" /> Cặp Khóa Bí Mật Ứng Dụng (OAuth2)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Client ID</Label>
                <Input
                  type="text"
                  placeholder={config?.hasClientId ? "•••••••• (Đã cấu hình)" : "Nhập Client ID"}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Client Secret</Label>
                <Input
                  type="password"
                  placeholder={config?.hasClientSecret ? "•••••••• (Đã cấu hình)" : "Nhập Client Secret"}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-muted-foreground" /> Tài khoản (Username)
                </Label>
                <Input
                  type="text"
                  placeholder={config?.hasUsername ? "•••••••• (Đã cấu hình)" : "Nhập Username"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3 text-muted-foreground" /> Mật khẩu (Password)
                </Label>
                <Input
                  type="password"
                  placeholder={config?.hasPassword ? "•••••••• (Đã cấu hình)" : "Nhập Mật khẩu"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Cặp key bí mật liên thông do Đắk Lắk cấp riêng cho từng đơn vị. Sau khi bạn cung cấp, hệ thống sẽ lưu an toàn và tự động lấy Token xác thực lên trục LGSP.
            </p>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-bold"
            >
              Đóng
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isLoading}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-500/20"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Đang lưu..." : "Lưu thông số kết nối"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
