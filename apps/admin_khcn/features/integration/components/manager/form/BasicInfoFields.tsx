import React from "react";
import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationFormValues } from "../../../schemas";

export function BasicInfoFields() {
  const { control } = useFormContext<IntegrationFormValues>();

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 font-semibold text-sm">
        <Info className="w-4 h-4" />
        Thông tin Chung
      </div>
      
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên Hệ thống đối tác <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Vd: Hệ thống LGSP Tỉnh..." className="bg-white dark:bg-slate-950" {...field} />
              </FormControl>
              <FormDescription>Tên hiển thị để nhận diện hệ thống ngoài.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã tích hợp (Integration Code) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="Vd: LGSP_HCM"
                  className="font-mono uppercase bg-white dark:bg-slate-950"
                  {...field}
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>Mã code định danh duy nhất (A-Z, 0-9, _).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
