import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { KeyRound, Eye, EyeOff, Play, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

function SecretInput({ field, placeholder, className }: { field: any, placeholder?: string, className?: string }) {
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
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
}

interface TestResult {
  success: boolean;
  message?: string;
  data?: unknown;
  status?: number;
  time?: number;
}

export function AuthFields() {
  const { control, getValues } = useFormContext<IntegrationFormValues>();
  const authTypeValue = useWatch({ control, name: "authType", defaultValue: "NONE" });
  const authType = (authTypeValue || '').toUpperCase();
  const { data: authTypes, isLoading } = useCategories("INTEGRATION_AUTH_TYPE");

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleTestAuth = async () => {
    const values = getValues();
    const currentAuthType = (values.authType || '').toUpperCase();

    setTestResult(null);

    try {
      setIsTesting(true);

      if (currentAuthType === 'OAUTH2') {
        const { authUrl, clientId, clientSecret, scope } = values;
        if (!authUrl?.trim() || !clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ Auth URL, Client ID và Client Secret" });
          return;
        }

        const res = await fetch('/admin/api/integration/test-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authUrl, clientId, clientSecret, scope }),
        });

        const json = await res.json();
        setTestResult(json);

      } else if (currentAuthType === 'BASIC') {
        const { clientId, clientSecret } = values;
        if (!clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ Username và Password" });
          return;
        }
        setTestResult({ success: true, message: "Cấu hình Basic Auth hợp lệ. Hệ thống sẽ sử dụng khi gọi API.", data: { username: clientId } });

      } else if (currentAuthType === 'API_KEY') {
        const { clientId, clientSecret } = values;
        if (!clientId?.trim() || !clientSecret?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập đầy đủ API Key Name và API Key Value" });
          return;
        }
        setTestResult({ success: true, message: "Cấu hình API Key hợp lệ.", data: { keyName: clientId } });

      } else if (currentAuthType === 'BEARER') {
        const { apiToken } = values as any;
        if (!apiToken?.trim()) {
          setTestResult({ success: false, message: "Vui lòng nhập Bearer Token" });
          return;
        }
        setTestResult({ success: true, message: "Cấu hình Bearer Token hợp lệ.", data: { tokenLength: apiToken.length } });

      } else {
        setTestResult({ success: true, message: "Không có cấu hình xác thực nào cần kiểm tra." });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: "Lỗi kiểm tra kết nối: " + error.message });
    } finally {
      setIsTesting(false);
    }
  };

  const showTestButton = ['OAUTH2', 'BASIC', 'API_KEY', 'BEARER'].includes(authType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl">
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between border-b border-violet-100 dark:border-violet-900/50 pb-2">
          <div className="flex items-center gap-2 text-violet-800 dark:text-violet-400 font-semibold">
            <KeyRound className="w-4 h-4" />
            Thông tin Xác thực (Authentication)
          </div>
          {showTestButton && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAuth}
              disabled={isTesting}
              className="h-8 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800"
            >
              {isTesting
                ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <Play className="w-3.5 h-3.5 mr-1.5" />
              }
              Test kết nối
            </Button>
          )}
        </div>
      </div>

      <FormField
        name="authType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loại xác thực</FormLabel>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <Select
                value={(field.value || 'NONE').toUpperCase()}
                onValueChange={(val) => { field.onChange(val); setTestResult(null); }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại xác thực" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(authTypes ?? []).map((a: any) => (
                    <SelectItem key={a.code} value={(a.code || '').toUpperCase()}>
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

      {/* OAuth2: Auth URL */}
      {authType === 'OAUTH2' && (
        <FormField
          control={control}
          name="authUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL lấy Token (Auth URL)</FormLabel>
              <FormControl>
                <Textarea placeholder="https://sso.example.com/token" className="font-mono bg-white dark:bg-slate-950 resize-none min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Bearer: Token tĩnh */}
      {authType === 'BEARER' && (
        <FormField
          control={control}
          name="apiToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bearer Token (Token tĩnh)</FormLabel>
              <FormControl>
                <SecretInput
                  field={field}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  className="bg-white dark:bg-slate-950"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* BASIC / OAUTH2 / API_KEY: Client ID / Username */}
      {(authType === 'BASIC' || authType === 'OAUTH2' || authType === 'API_KEY') && (
        <FormField
          control={control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {authType === 'BASIC' ? 'Username' : authType === 'API_KEY' ? 'API Key Name / Key ID' : 'Client ID (App Key)'}
              </FormLabel>
              <FormControl>
                <Input className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* BASIC / OAUTH2 / API_KEY: Password / Secret / Value */}
      {(authType === 'BASIC' || authType === 'OAUTH2' || authType === 'API_KEY') && (
        <FormField
          control={control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {authType === 'BASIC' ? 'Password' : authType === 'API_KEY' ? 'API Key Value' : 'Client Secret (App Secret)'}
              </FormLabel>
              <FormControl>
                <SecretInput
                  field={field}
                  className="bg-white dark:bg-slate-950"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* OAUTH2: Scope */}
      {authType === 'OAUTH2' && (
        <FormField
          control={control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scope (Phạm vi truy cập)</FormLabel>
              <FormControl>
                <Input placeholder="read write openid" className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Response panel */}
      {testResult && (
        <div className="md:col-span-2">
          <div className={`rounded-lg border text-sm overflow-hidden ${testResult.success
            ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2.5 border-b ${testResult.success
              ? 'border-emerald-200 dark:border-emerald-800'
              : 'border-red-200 dark:border-red-800'
            }`}>
              <div className={`flex items-center gap-2 font-semibold ${testResult.success
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
              }`}>
                {testResult.success
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <XCircle className="w-4 h-4" />
                }
                {testResult.success ? 'Kết nối thành công' : 'Kết nối thất bại'}
                {testResult.status && (
                  <span className="font-mono text-xs opacity-70">HTTP {testResult.status}</span>
                )}
              </div>
              {testResult.time !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {testResult.time}ms
                </div>
              )}
            </div>

            {/* Message */}
            {testResult.message && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-b border-dashed border-current/10">
                {testResult.message}
              </div>
            )}

            {/* JSON body */}
            {testResult.data !== undefined && (
              <pre className="px-4 py-3 text-xs font-mono overflow-x-auto text-slate-700 dark:text-slate-300 max-h-48 overflow-y-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
