import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { IntegrationFormValues } from "../../../schemas";

export function RawConfigFields() {
  const { control } = useFormContext<IntegrationFormValues>();

  return (
    <FormField
      name="rawConfig"
      render={({ field }) => (
        <FormItem className="animate-in fade-in zoom-in-95 duration-200 h-[400px] flex flex-col space-y-2">
          <FormLabel>JSON Configuration Data</FormLabel>
          <FormControl>
            <Textarea
              className="flex-1 font-mono text-sm p-4 bg-slate-900 text-slate-300 rounded-xl resize-none"
              spellCheck={false}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
