'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  ArrowRight,
  Server,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { useUpdateConnection, useTestConnection } from '../hooks/useApiManagement';

interface Props {
  id: string;
  data: any;
}

interface TestResult {
  success: boolean;
  statusCode: number;
  latencyMs: number;
  message: string;
  authModel: string;
}

export default function ApiConnectionAuthDialog({ id, data }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [authKind, setAuthKind] = useState<string>('none');
  const [authSecret, setAuthSecret] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [tokenUrl, setTokenUrl] = useState<string>('');
  const [headerName, setHeaderName] = useState<string>('x-api-key');
  const [headerPrefix, setHeaderPrefix] = useState<string>('');
  const [scope, setScope] = useState<string>('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const updateMut = useUpdateConnection();
  const testMut = useTestConnection();

  useEffect(() => {
    if (data?.auth) {
      setAuthKind(data.auth.kind || 'none');
      setClientId(data.auth.clientId || '');
      setTokenUrl(data.auth.tokenUrl || '');
      setHeaderName(data.auth.headerName || (data.auth.kind === 'apiKey' ? 'x-api-key' : ''));
      setHeaderPrefix(data.auth.headerPrefix || '');
      setScope(data.auth.scope || '');
    }
    setTestResult(null);
  }, [data, sheetOpen]);

  // Đổi preset mô hình chứng thực
  const handleKindChange = (newKind: string) => {
    setAuthKind(newKind);
    setTestResult(null);
    if (newKind === 'apiKey') {
      if (!headerName) setHeaderName('x-api-key');
    } else if (newKind === 'bearer') {
      if (!headerPrefix) setHeaderPrefix('Bearer ');
    } else if (newKind === 'lgsp') {
      if (!headerName) setHeaderName('Authorization');
    }
  };

  const handleUpdateAuth = () => {
    if (!data) return;
    const cleanSecret = authSecret.trim();

    updateMut.mutate(
      {
        id,
        data: {
          auth: {
            kind: authKind as any,
            ...(authKind === 'oauth2' || authKind === 'lgsp'
              ? {
                  clientId: clientId.trim(),
                  tokenUrl: tokenUrl.trim(),
                  scope: scope.trim() || undefined,
                }
              : {}),
            ...(authKind === 'apiKey'
              ? {
                  headerName: headerName.trim() || 'x-api-key',
                  headerPrefix: headerPrefix.trim() || undefined,
                }
              : {}),
            ...(authKind === 'bearer'
              ? {
                  headerPrefix: headerPrefix.trim() || 'Bearer ',
                }
              : {}),
            ...(cleanSecret ? { secret: cleanSecret } : {}),
          },
          expectedVersion: data.version,
        },
      },
      {
        onSuccess: () => {
          setSheetOpen(false);
          setAuthSecret('');
          setTestResult(null);
        },
      },
    );
  };

  const handleRunTest = () => {
    setTestResult(null);
    testMut.mutate(id, {
      onSuccess: (res: any) => {
        setTestResult(res);
      },
      onError: (err: any) => {
        setTestResult({
          success: false,
          statusCode: 500,
          latencyMs: 0,
          message: err?.response?.data?.message || 'Lỗi khi gọi kiểm tra liên thông qua Gateway',
          authModel: authKind,
        });
      },
    });
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10">
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 overflow-hidden flex flex-col h-full border-l shadow-2xl bg-background"
      >
        <SheetHeader className="px-6 py-5 border-b bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary border border-primary/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground truncate">
                Mô hình hóa Chứng thực Liên thông
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                Cấu hình đúng chuẩn liên thông (LGSP, OAuth2, API Key) & kiểm tra kết nối thực tế tới Upstream
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-w-0 custom-scrollbar">
          {/* Thông tin kết nối mục tiêu */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Hệ thống đích
              </span>
              <h4 className="text-sm font-bold text-foreground truncate mt-0.5">
                {data?.displayName || 'API Connection'} ({data?.code})
              </h4>
              <p className="text-xs font-mono text-muted-foreground break-all mt-1">
                {data?.baseUrl}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 bg-background">
              Vùng mạng: {data?.networkZone || 'external'}
            </Badge>
          </div>

          {/* Sơ đồ mô hình hóa luồng chứng thực */}
          <div className="p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 to-transparent dark:from-indigo-950/20 space-y-2.5 min-w-0">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
              <Workflow className="w-3.5 h-3.5" />
              Sơ đồ kiến trúc luồng dữ liệu (Visual Auth Flow)
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-background/80 p-3 rounded-lg border border-border/60 min-w-0">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold shrink-0">
                Client / App
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="px-2 py-1 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-semibold shrink-0">
                Gateway (SSRF Guard)
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold shrink-0">
                {authKind === 'lgsp'
                  ? 'LGSP Token Engine (TTL Cache)'
                  : authKind === 'oauth2'
                  ? 'OAuth2 Engine (TTL Cache)'
                  : authKind === 'apiKey'
                  ? `Inject [${headerName || 'x-api-key'}]`
                  : authKind === 'bearer'
                  ? 'Inject [Bearer Token]'
                  : authKind === 'basic'
                  ? 'Inject [Basic Auth]'
                  : 'Passthrough'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0 truncate max-w-[200px]">
                Upstream Target
              </span>
            </div>
          </div>

          {/* Form cấu hình chi tiết theo mô hình */}
          <div className="space-y-4 min-w-0">
            <div className="grid gap-2">
              <Label className="text-sm font-semibold">Chuẩn liên thông & Mô hình xác thực</Label>
              <Select value={authKind} onValueChange={handleKindChange}>
                <SelectTrigger className="h-11 font-medium bg-background">
                  <SelectValue placeholder="Chọn chuẩn liên thông" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không xác thực (None / Public API)</SelectItem>
                  <SelectItem value="lgsp">Trục liên thông LGSP / NDXP Quốc gia (Chính phủ số)</SelectItem>
                  <SelectItem value="oauth2">OAuth 2.0 (Client Credentials Grant & Token Cache)</SelectItem>
                  <SelectItem value="apiKey">API Key / Custom Header (Header hoặc Query)</SelectItem>
                  <SelectItem value="bearer">Bearer Token (JWT / Static Secret)</SelectItem>
                  <SelectItem value="basic">HTTP Basic Authentication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Các trường cấu hình riêng theo mô hình */}
            {(authKind === 'oauth2' || authKind === 'lgsp') && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Cấu hình Cấp phát Token {authKind === 'lgsp' ? 'LGSP / NDXP' : 'OAuth 2.0'}
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold">Token Endpoint URL (Cấp phát mã truy cập)</Label>
                  <Input
                    value={tokenUrl}
                    onChange={(e) => setTokenUrl(e.target.value)}
                    placeholder={
                      authKind === 'lgsp'
                        ? 'https://lgsp.daklak.gov.vn/token'
                        : 'https://auth.example.com/oauth/token'
                    }
                    className="font-mono text-xs h-10"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Gateway sẽ tự động gửi request xin token, cache an toàn theo TTL (thời hạn hiệu lực) và tự động làm mới khi hết hạn.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold">
                      {authKind === 'lgsp' ? 'Consumer Key / Client ID' : 'Client ID'}
                    </Label>
                    <Input
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Nhập Client ID..."
                      className="font-mono text-xs h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold">Scope (Tùy chọn)</Label>
                    <Input
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      placeholder="vd: openid dvc_daklak"
                      className="font-mono text-xs h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {authKind === 'apiKey' && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  Cấu hình Header API Key tùy biến
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold">Tên Header (Header Name)</Label>
                    <Input
                      value={headerName}
                      onChange={(e) => setHeaderName(e.target.value)}
                      placeholder="x-api-key"
                      className="font-mono text-xs h-10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-semibold">Tiền tố giá trị (Header Prefix)</Label>
                    <Input
                      value={headerPrefix}
                      onChange={(e) => setHeaderPrefix(e.target.value)}
                      placeholder="vd: ApiKey  (để trống nếu không có)"
                      className="font-mono text-xs h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            {authKind === 'bearer' && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-4 animate-in fade-in-50 duration-300">
                <div className="grid gap-2">
                  <Label className="text-xs font-semibold">Tiền tố Header (Mặc định: Bearer )</Label>
                  <Input
                    value={headerPrefix}
                    onChange={(e) => setHeaderPrefix(e.target.value)}
                    placeholder="Bearer "
                    className="font-mono text-xs h-10"
                  />
                </div>
              </div>
            )}

            {/* Khóa bí mật (Secret / Token / Private Key) */}
            {authKind !== 'none' && (
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    {authKind === 'oauth2' || authKind === 'lgsp'
                      ? 'Consumer Secret / Client Secret'
                      : authKind === 'apiKey'
                      ? 'Giá trị API Key / Secret'
                      : authKind === 'bearer'
                      ? 'Chuỗi Bearer Token'
                      : 'Mật khẩu / Chuỗi Secret'}
                  </Label>
                  {data.auth?.secretRef && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã mã hóa AES-256 trong CSDL
                    </span>
                  )}
                </div>
                <Input
                  type="password"
                  value={authSecret}
                  onChange={(e) => setAuthSecret(e.target.value)}
                  placeholder={
                    data.auth?.secretRef
                      ? '(Đã lưu trong CSDL - Chỉ nhập nếu muốn thay đổi)'
                      : 'Nhập secret...'
                  }
                  className="font-mono text-xs h-10"
                />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {data.auth?.secretRef
                    ? 'Bí mật hiện hành đã được mã hóa an toàn bằng thuật toán AES-256-GCM. Bạn có thể để trống ô này để tiếp tục giữ nguyên bí mật cũ.'
                    : 'Bí mật sẽ được mã hóa an toàn AES-256-GCM trước khi lưu vào CSDL của user-service.'}
                </p>
              </div>
            )}

            {/* Bảng kết quả Thẩm định Liên thông thực tế (Test Connection Panel) */}
            {testResult && (
              <div
                className={`p-4 rounded-xl border transition-all animate-in zoom-in-95 duration-200 ${
                  testResult.success
                    ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800'
                    : 'bg-red-50/70 border-red-300 dark:bg-red-950/30 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      testResult.success
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5
                        className={`text-sm font-bold ${
                          testResult.success
                            ? 'text-emerald-900 dark:text-emerald-200'
                            : 'text-red-900 dark:text-red-200'
                        }`}
                      >
                        {testResult.success
                          ? 'Thẩm định Liên thông Thành công'
                          : 'Thẩm định Liên thông Không thành công'}
                      </h5>
                      <Badge
                        variant={testResult.success ? 'default' : 'destructive'}
                        className="text-[10px] font-mono px-2 py-0"
                      >
                        HTTP {testResult.statusCode}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono bg-background">
                        {testResult.latencyMs} ms
                      </Badge>
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        testResult.success
                          ? 'text-emerald-800 dark:text-emerald-300'
                          : 'text-red-800 dark:text-red-300'
                      }`}
                    >
                      {testResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Thao tác */}
        <div className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 font-semibold text-xs h-10"
            onClick={handleRunTest}
            disabled={testMut.isPending}
          >
            {testMut.isPending ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" />
            )}
            Thẩm định & Kiểm tra liên thông thực tế
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              className="h-10 text-xs"
              onClick={() => setSheetOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              className="h-10 text-xs px-5 bg-primary hover:bg-primary/90 font-semibold"
              onClick={handleUpdateAuth}
              disabled={updateMut.isPending}
            >
              {updateMut.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Lưu cấu hình chứng thực
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
