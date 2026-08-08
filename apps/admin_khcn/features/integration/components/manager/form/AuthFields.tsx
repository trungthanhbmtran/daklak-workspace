import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

function SecretInput({ field, placeholder, className }: { field: any, placeholder?: string, className?: string }) {
  const [show, setShow] = React.useState(false);
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
  const { control } = useFormContext<IntegrationFormValues>();
  const authTypeValue = useWatch({ control, name: "authType", defaultValue: "NONE" });
  const authType = (authTypeValue || '').toUpperCase();
  const { data: authTypes, isLoading } = useCategories("INTEGRATION_AUTH_TYPE");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl">
      <div className="space-y-4 md:col-span-2">
        <div className="flex items-center gap-2 text-violet-800 dark:text-violet-400 font-semibold border-b border-violet-100 dark:border-violet-900/50 pb-2">
          <KeyRound className="w-4 h-4" />
          Thông tin Xác thực (Authentication)
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

