import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { KeyRound, Eye, EyeOff, Play, Loader2 } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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

export function AuthFields() {
  const { control, getValues } = useFormContext<IntegrationFormValues>();
  const authTypeValue = useWatch({ control, name: "authType", defaultValue: "NONE" });
  const authType = (authTypeValue || '').toUpperCase();
  const { data: authTypes, isLoading } = useCategories("INTEGRATION_AUTH_TYPE");

  const [isTesting, setIsTesting] = useState(false);

  const handleTestAuth = async () => {
    try {
      setIsTesting(true);
      const values = getValues();
      const currentAuthType = (values.authType || '').toUpperCase();
      
      if (currentAuthType === 'OAUTH2') {
        const { authUrl, clientId, clientSecret, scope } = values;
        if (!authUrl || !clientId || !clientSecret) {
          toast.error("Vui lòng nhập đầy đủ Auth URL, Client ID và Client Secret");
          return;
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        if (scope) params.append('scope', scope);

        const basicAuth = btoa(`${clientId}:${clientSecret}`);

        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${basicAuth}`
          },
          body: params
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        if (data.access_token) {
          toast.success("Kết nối thành công! Đã lấy được Access Token.");
        } else {
          toast.warning("Phản hồi thành công nhưng không chứa access_token.");
        }
      } else if (currentAuthType === 'BASIC') {
        const { clientId, clientSecret } = values;
        if (!clientId || !clientSecret) {
          toast.error("Vui lòng nhập đầy đủ Username và Password");
          return;
        }
        toast.success("Cấu hình Basic Auth hợp lệ. Hệ thống sẽ sử dụng khi gọi API.");
      } else if (currentAuthType === 'API_KEY') {
        toast.success("Cấu hình API Key hợp lệ.");
      } else if (currentAuthType === 'BEARER') {
        toast.success("Cấu hình Bearer Token hợp lệ.");
      } else {
        toast.info("Không có cấu hình xác thực nào cần kiểm tra.");
      }
    } catch (error: any) {
      toast.error("Lỗi kiểm tra kết nối: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl">
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center justify-between text-violet-800 dark:text-violet-400 font-semibold border-b border-violet-100 dark:border-violet-900/50 pb-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            Thông tin Xác thực (Authentication)
          </div>
          {(authType === 'OAUTH2' || authType === 'BASIC' || authType === 'API_KEY' || authType === 'BEARER') && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestAuth}
              disabled={isTesting}
              className="h-8 text-xs bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 dark:text-violet-300 dark:border-violet-800"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
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
                onValueChange={(val) => field.onChange(val)}
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
    </div>
  );
}

