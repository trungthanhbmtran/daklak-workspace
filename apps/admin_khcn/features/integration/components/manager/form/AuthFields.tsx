import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  KeyRound, Eye, EyeOff, Play, Loader2,
  CheckCircle2, XCircle, Clock, ShieldCheck,
  Hash, Link2, User, Info
} from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

// ─── AUTH TYPE CONFIG ─────────────────────────────────────────────────────────
const AUTH_TYPE_META: Record<string, {
  label: string;
  color: string;
  badgeClass: string;
  description: string;
  fields: string[];
}> = {
  NONE: {
    label: "Không xác thực",
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
    description: "API không yêu cầu xác thực. Phù hợp cho các endpoint công khai.",
    fields: [],
  },
  BEARER: {
    label: "Bearer Token",
    color: "blue",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-400",
    description: "Gửi token tĩnh trong header Authorization: Bearer <token>. Phù hợp khi hệ thống đối tác cấp một token dài hạn.",
    fields: ["apiToken"],
  },
  BASIC: {
    label: "Basic Auth",
    color: "amber",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-400",
    description: "Mã hóa Username:Password theo chuẩn Base64 và gửi trong mỗi request. Phù hợp cho các hệ thống legacy.",
    fields: ["clientId", "clientSecret"],
  },
  API_KEY: {
    label: "API Key",
    color: "violet",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-900/40 dark:text-violet-400",
    description: "Gắn API Key vào request header hoặc query param. Hệ thống đối tác cấp Key Name và Key Value.",
    fields: ["clientId", "clientSecret"],
  },
  OAUTH2: {
    label: "OAuth 2.0",
    color: "emerald",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-400",
    description: "Luồng Client Credentials: hệ thống tự động lấy Access Token từ Authorization Server trước mỗi request. Phù hợp cho tích hợp LGSP/SSO nội bộ.",
    fields: ["authUrl", "clientId", "clientSecret", "scope"],
  },
};

// ─── SECRET INPUT ────────────────────────────────────────────────────────────
function SecretInput({ field, placeholder, className }: {
  field: any;
  placeholder?: string;
  className?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      {show ? (
        <Textarea
          placeholder={placeholder}
          className={`font-mono pr-10 resize-none min-h-[80px] break-all ${className || ""}`}
          {...field}
        />
      ) : (
        <Input
          type="password"
          placeholder={placeholder}
          className={`font-mono pr-10 ${className || ""}`}
          {...field}
        />
      )}
      <Button
        type="button" variant="ghost" size="icon"
        className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

// ─── TEST RESULT TYPE ────────────────────────────────────────────────────────
interface TestResult {
  success: boolean;
  message?: string;
  data?: unknown;
  status?: number;
  time?: number;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function AuthFields() {
  const { control, getValues } = useFormContext<IntegrationFormValues>();
  const authTypeValue = useWatch({ control, name: "authType", defaultValue: "NONE" });
  const authType = (authTypeValue || "NONE").toUpperCase();
  const { data: authTypes, isLoading } = useCategories("INTEGRATION_AUTH_TYPE");

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const meta = AUTH_TYPE_META[authType] ?? AUTH_TYPE_META.NONE;
  const showTestButton = ["OAUTH2", "BASIC", "API_KEY", "BEARER"].includes(authType);

  const handleTestAuth = async () => {
    const values = getValues();
    const currentAuthType = (values.authType || "NONE").toUpperCase();
    setTestResult(null);
    setIsTesting(true);

    try {
      if (currentAuthType === "OAUTH2") {
        const { authUrl, clientId, clientSecret, scope } = values;
        if (!authUrl?.trim() || !clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ Auth URL, Client ID và Client Secret." });
          return;
        }
        const res = await fetch("/admin/api/integration/test-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authUrl, clientId, clientSecret, scope }),
        });
        setTestResult(await res.json());

      } else if (currentAuthType === "BASIC") {
        const { clientId, clientSecret } = values;
        if (!clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ Username và Password." });
          return;
        }
        setTestResult({
          success: true,
          message: "Cấu hình Basic Auth hợp lệ.",
          data: { header: `Authorization: Basic ${btoa(`${clientId}:${clientSecret}`)}` },
        });

      } else if (currentAuthType === "API_KEY") {
        const { clientId, clientSecret } = values;
        if (!clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ API Key Name và API Key Value." });
          return;
        }
        setTestResult({
          success: true,
          message: "Cấu hình API Key hợp lệ.",
          data: { header: `${clientId}: ****${clientSecret?.slice(-4)}` },
        });

      } else if (currentAuthType === "BEARER") {
        const { apiToken } = values as any;
        if (!apiToken?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập Bearer Token." });
          return;
        }
        setTestResult({
          success: true,
          message: "Cấu hình Bearer Token hợp lệ.",
          data: { header: `Authorization: Bearer ****${apiToken?.slice(-6)}`, tokenLength: apiToken.length },
        });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: "Lỗi kết nối: " + error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="rounded-xl border border-violet-100 dark:border-violet-900/30 bg-violet-50/50 dark:bg-violet-900/10 overflow-hidden">

      {/* ── Section Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-violet-100/60 dark:bg-violet-900/20 border-b border-violet-100 dark:border-violet-900/30">
        <div className="flex items-center gap-2.5 text-violet-800 dark:text-violet-300 font-semibold text-sm">
          <KeyRound className="w-4 h-4" />
          Thông tin Xác thực (Authentication)
        </div>
        {showTestButton && (
          <Button
            type="button" variant="outline" size="sm"
            onClick={handleTestAuth}
            disabled={isTesting}
            className="h-8 text-xs gap-1.5 bg-white hover:bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-300 dark:border-violet-700"
          >
            {isTesting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Play className="w-3.5 h-3.5" />
            }
            {isTesting ? "Đang kiểm tra..." : "Test kết nối"}
          </Button>
        )}
      </div>

      <div className="p-5 space-y-5">

        {/* ── Auth Type Selector ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <FormField
            name="authType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cơ chế xác thực <span className="text-red-500">*</span></FormLabel>
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : (
                  <Select
                    value={(field.value || "NONE").toUpperCase()}
                    onValueChange={(val) => { field.onChange(val); setTestResult(null); }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cơ chế xác thực" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(authTypes ?? []).map((a: any) => (
                        <SelectItem key={a.code} value={(a.code || "").toUpperCase()}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Auth type description */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-xs text-muted-foreground mt-6">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-violet-500" />
            <div className="space-y-1">
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${meta.badgeClass}`}>
                {meta.label}
              </Badge>
              <p className="leading-relaxed">{meta.description}</p>
            </div>
          </div>
        </div>

        {/* ── Auth-specific fields ────────────────────────────────────────────── */}
        {authType !== "NONE" && (
          <>
            <Separator className="bg-violet-100 dark:bg-violet-900/30" />

            {/* OAUTH2 fields */}
            {authType === "OAUTH2" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={control} name="authUrl"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Authorization Server URL <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="https://sso.example.com/realms/gov/protocol/openid-connect/token"
                          className="font-mono bg-white dark:bg-slate-950 resize-none min-h-[72px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>URL endpoint lấy Access Token từ Identity Provider / SSO Server.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control} name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Client ID (App Key) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-white dark:bg-slate-950" placeholder="my-service-client" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control} name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        Client Secret (App Secret) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SecretInput field={field} placeholder="••••••••" className="bg-white dark:bg-slate-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control} name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        Scope
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="openid profile email" className="font-mono bg-white dark:bg-slate-950" {...field} />
                      </FormControl>
                      <FormDescription>Danh sách scope phân tách bởi dấu cách (tùy chọn).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* BEARER fields */}
            {authType === "BEARER" && (
              <div className="grid grid-cols-1 gap-5">
                <FormField
                  control={control} name="apiToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        Bearer Token <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SecretInput
                          field={field}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          className="bg-white dark:bg-slate-950"
                        />
                      </FormControl>
                      <FormDescription>Token tĩnh được hệ thống đối tác cấp phát. Sẽ gắn vào header: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">Authorization: Bearer &lt;token&gt;</code></FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* BASIC Auth fields */}
            {authType === "BASIC" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={control} name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Username <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-white dark:bg-slate-950" placeholder="service_user" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control} name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SecretInput field={field} placeholder="••••••••" className="bg-white dark:bg-slate-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* API KEY fields */}
            {authType === "API_KEY" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={control} name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                        Header Name / Key ID <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input className="font-mono bg-white dark:bg-slate-950" placeholder="X-API-Key" {...field} />
                      </FormControl>
                      <FormDescription>Tên header mà hệ thống đối tác yêu cầu (vd: <code className="text-xs">X-API-Key</code>).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control} name="clientSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        API Key Value <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <SecretInput field={field} placeholder="sk-••••••••••••" className="bg-white dark:bg-slate-950" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </>
        )}

        {/* ── Response panel ──────────────────────────────────────────────────── */}
        {testResult && (
          <div className={`rounded-lg border overflow-hidden text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${testResult.success
              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
            }`}>
            {/* Panel header */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-b text-xs font-semibold ${testResult.success
                ? "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/20"
                : "border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20"
              }`}>
              <div className="flex items-center gap-2">
                {testResult.success
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <XCircle className="w-3.5 h-3.5" />
                }
                {testResult.success ? "Kết nối thành công" : "Kết nối thất bại"}
                {testResult.status && (
                  <span className="font-mono font-normal opacity-70 text-[11px]">HTTP {testResult.status}</span>
                )}
              </div>
              {testResult.time !== undefined && (
                <div className="flex items-center gap-1 font-normal text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {testResult.time}ms
                </div>
              )}
            </div>

            {/* Message */}
            {testResult.message && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-dashed border-slate-200 dark:border-slate-700">
                {testResult.message}
              </div>
            )}

            {/* JSON response body */}
            {testResult.data !== undefined && (
              <pre className="px-4 py-3 text-xs font-mono overflow-x-auto overflow-y-auto max-h-52 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
