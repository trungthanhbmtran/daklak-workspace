import React from "react";
import { useFormContext } from "react-hook-form";
import { Info } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { IntegrationFormValues } from "../../../schemas";

export function BasicInfoFields() {
  const { control } = useFormContext<IntegrationFormValues>();

  return (
    <Collapsible className="rounded-md border bg-card overflow-hidden" defaultOpen={false}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2.5 px-5 py-3.5 bg-muted/50 font-semibold text-sm hover:bg-muted/70 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4" />
          Thông tin Chung
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-5 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Hệ thống đối tác <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Hệ thống LGSP Tỉnh..." {...field} />
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
                    className="font-mono uppercase"
                    {...field}
                    onChange={e => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>Mã code định danh duy nhất (A-Z, 0-9, _).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phiên bản API (Tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Vd: v1.0.0, v2..."
                    className="font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Hữu ích khi hệ thống có nhiều version.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
