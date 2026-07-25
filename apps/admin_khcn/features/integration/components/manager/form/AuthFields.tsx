import React from "react";
import { useFormContext } from "react-hook-form";
import { KeyRound } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

export function AuthFields() {
  const { control, watch } = useFormContext<IntegrationFormValues>();
  const authType = watch("authType");
  const { data: authTypes } = useCategories("INTEGRATION_AUTH_TYPE");

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
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại xác thực" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {authTypes?.map(a => (
                  <SelectItem key={a.code} value={a.code}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {authType === 'OAUTH2' && (
        <FormField
          control={control}
          name="authUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL lấy Token (Auth URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://sso.example.com/token" className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {authType === 'BEARER' && (
        <FormField
          control={control}
          name="apiToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Bearer Token (Nếu dùng Token tĩnh)</FormLabel>
              <FormControl>
                <Input type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..." className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(authType === 'BASIC' || authType === 'OAUTH2' || authType === 'API_KEY') && (
        <FormField
          control={control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{authType === 'BASIC' ? 'Username' : 'Client ID (App Key)'}</FormLabel>
              <FormControl>
                <Input className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {(authType === 'BASIC' || authType === 'OAUTH2') && (
        <FormField
          control={control}
          name="clientSecret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{authType === 'BASIC' ? 'Password' : 'Client Secret (App Secret)'}</FormLabel>
              <FormControl>
                <Input type="password" className="font-mono bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
