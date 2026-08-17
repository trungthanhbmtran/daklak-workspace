import React from "react";
import { useFormContext } from "react-hook-form";
import { Globe } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

export function ProtocolFields() {
  const { control } = useFormContext<IntegrationFormValues>();
  const { data: protocols, isLoading } = useCategories("INTEGRATION_PROTOCOL");

  return (
    <div className="rounded-xl border border-sky-100 dark:border-sky-900/30 bg-sky-50/50 dark:bg-sky-900/10 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-sky-100/60 dark:bg-sky-900/20 border-b border-sky-100 dark:border-sky-900/30 text-sky-800 dark:text-sky-300 font-semibold text-sm">
        <Globe className="w-4 h-4" />
        Kết nối (Protocol & Endpoint)
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="protocol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giao thức (Protocol)</FormLabel>
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="bg-white dark:bg-slate-950">
                      <SelectValue placeholder="Chọn giao thức" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(protocols ?? []).map((p: any) => (
                      <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormDescription>Loại giao thức để gọi hệ thống đối tác.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          name="baseUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Máy chủ (Base URL)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="https://api.example.com/v1" 
                  className="font-mono resize-none min-h-[60px] bg-white dark:bg-slate-950" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>Địa chỉ gốc của các API liên thông.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
