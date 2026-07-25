import React from "react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

export function ProtocolFields() {
  const { control } = useFormContext<IntegrationFormValues>();
  const { data: protocols } = useCategories("INTEGRATION_PROTOCOL");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        name="protocol"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Giao thức (Protocol)</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giao thức" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {protocols?.map(p => (
                  <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Input placeholder="https://api.example.com/v1" className="font-mono" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
