import React from "react";
import { useFormContext } from "react-hook-form";
import { Globe, ChevronDown } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { IntegrationFormValues } from "../../../schemas";
import { useCategories } from "../../../api";

export function ProtocolFields() {
  const { control } = useFormContext<IntegrationFormValues>();
  const { data: protocols, isLoading } = useCategories("INTEGRATION_PROTOCOL");

  return (
    <Collapsible className="rounded-md border bg-card overflow-hidden" defaultOpen={false}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2.5 px-5 py-3.5 bg-muted/50 font-semibold text-sm hover:bg-muted/70 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4" />
          Kết nối (Protocol & Endpoint)
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-5 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="font-mono resize-none min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Địa chỉ gốc của các API liên thông.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
