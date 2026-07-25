import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IntegrationFormValues } from "../../../schemas";

export function BasicInfoFields() {
  const { control } = useFormContext<IntegrationFormValues>();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tên Hệ thống đối tác <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Vd: Hệ thống LGSP Tỉnh..." {...field} />
            </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
