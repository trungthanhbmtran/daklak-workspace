import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

export function ProtocolFields() {
  const { control } = useFormContext<IntegrationFormValues>();
  const { data: protocols, isLoading } = useCategories("INTEGRATION_PROTOCOL");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <SelectTrigger>
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
              <Textarea placeholder="https://api.example.com/v1" className="font-mono resize-none min-h-[60px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

