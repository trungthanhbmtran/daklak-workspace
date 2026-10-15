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
import {
  ShieldCheck,
  AlertCircle,
  Key,
  Server,
  Lock,
  UserCheck,
  Save,
  Activity,
  CheckCircle2,
  XCircle,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLgspConfig, useDocuments } from "../hooks/useDocuments";

interface LgspConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LgspConfigModal({ open, onOpenChange }: LgspConfigModalProps) {
  const { data: config, isLoading } = useLgspConfig();
  const { updateLgspConfig, testLgspConnection } = useDocuments();

  const [systemCode, setSystemCode] = useState("0400101394-CTDL-012");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ssoUrl, setSsoUrl] = useState("https://lifesso.daklak.gov.vn:9445/oauth2/token");
  const [baseUrl, setBaseUrl] = useState("https://lifelgsp.daklak.gov.vn:8243");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (config) {
      if (config.systemCode) setSystemCode(config.systemCode);
      if (config.ssoUrl) setSsoUrl(config.ssoUrl);
      if (config.baseUrl) setBaseUrl(config.baseUrl);
    }
  }, [config]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testLgspConnection();
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.message || err?.message || "Kiểm tra kết nối thất bại",
        ssoStatus: "Lỗi",
        gatewayStatus: "Lỗi",
        isVpnReachable: false,
      });
    } finally {
      setIsTesting(false);
    }
  };

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
        ssoUrl: ssoUrl || undefined,
        baseUrl: baseUrl || undefined,
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
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-background border shadow-2xl">
        <DialogHeader className="space-y-3 pb-2 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-blue-500/10 rounded-2xl text-blue-600 shrink-0">
                <Server className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-black truncate">Cấu hình Trục Liên thông LGSP</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  Nền tảng quản lý văn bản, liên thông dữ liệu tỉnh Đắk Lắk
                </DialogDescription>
              </div>
            </div>
            {isConfigured ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold px-3 py-1 gap-1 shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" /> Sẵn sàng
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 font-bold px-3 py-1 gap-1 shrink-0">
                <AlertCircle className="h-3.5 w-3.5" /> Chờ Secret Key
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* Diagnostic Bar / Test Connection */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Thẩm định Kết nối Hạ tầng LGSP
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="h-8 rounded-xl border-blue-200 text-blue-600 font-bold hover:bg-blue-50 text-xs px-3"
            >
              {isTesting ? "Đang probe..." : "Kiểm tra kết nối"}
            </Button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs space-y-2 border ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-200 text-emerald-800 dark:text-emerald-300"
                  : "bg-rose-500/10 border-rose-200 text-rose-800 dark:text-rose-300"
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 min-w-0">
                  <p className="font-bold wrap-break-word">{testResult.message}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 bg-background/80 rounded-md border">
                      SSO: {testResult.ssoStatus || "N/A"} ({testResult.ssoLatencyMs || 0}ms)
                    </span>
                    <span className="px-2 py-0.5 bg-background/80 rounded-md border">
                      Gateway: {testResult.gatewayStatus || "N/A"} ({testResult.gatewayLatencyMs || 0}ms)
                    </span>
                  </div>
                </div>
              </div>

              {!testResult.isVpnReachable && (
                <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  <strong>Khuyến cáo:</strong> Trục LGSP tỉnh Đắk Lắk (10.30.1.6, 10.30.1.7) nằm trên mạng nội bộ / VPN chuyên dùng tỉnh. Nếu máy chủ của bạn chưa đấu nối VPN, hãy liên hệ quản trị mạng để kích hoạt VPN hoặc cấu hình đường truyền chuyên dụng.
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5 py-2">
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
              <div className="space-y-1 min-w-0">
                <Label className="text-xs font-medium">Client ID</Label>
                <Input
                  type="text"
                  placeholder={config?.hasClientId ? "•••••••• (Đã cấu hình)" : "Nhập Client ID"}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1 min-w-0">
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
              <div className="space-y-1 min-w-0">
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

              <div className="space-y-1 min-w-0">
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
              Cặp key bí mật liên thông do Đắk Lắk cấp riêng cho từng đơn vị. Sau khi cấu hình, hệ thống sẽ lưu an toàn và tự động cấp Access Token để đồng bộ văn bản.
            </p>
          </div>

          {/* Cấu hình Nâng cao (URL Máy chủ LGSP & SSO) */}
          <div className="border border-border/60 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-3.5 bg-muted/10 hover:bg-muted/20 text-xs font-bold text-muted-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-500" />
                <span>Cấu hình Địa chỉ Máy chủ (URL Trục & SSO)</span>
              </div>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-muted/5 space-y-3 border-t">
                <div className="space-y-1 min-w-0">
                  <Label className="text-xs font-medium">URL Cấp Token SSO LGSP</Label>
                  <Input
                    type="text"
                    value={ssoUrl}
                    onChange={(e) => setSsoUrl(e.target.value)}
                    className="rounded-xl font-mono text-xs"
                    placeholder="https://lifesso.daklak.gov.vn:9445/oauth2/token"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Mặc định: <code className="font-bold">https://lifesso.daklak.gov.vn:9445/oauth2/token</code>
                  </p>
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="text-xs font-medium">URL Trục Liên thông LGSP (Base)</Label>
                  <Input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="rounded-xl font-mono text-xs"
                    placeholder="https://lifelgsp.daklak.gov.vn:8243"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Mặc định: <code className="font-bold">https://lifelgsp.daklak.gov.vn:8243</code>
                  </p>
                </div>
              </div>
            )}
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
