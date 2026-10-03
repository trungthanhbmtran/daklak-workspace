import React from "react";
import { useFormContext } from "react-hook-form";
import { Settings2, ChevronDown } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { IntegrationFormValues } from "../../../schemas";

export function AdvancedConfigFields() {
  const { control } = useFormContext<IntegrationFormValues>();

  return (
    <Collapsible className="rounded-md border bg-card overflow-hidden" defaultOpen={false}>
      <div className="flex w-full items-center justify-between px-5 py-2.5 bg-muted/50 border-b">
        <div className="flex items-center gap-2.5 font-semibold text-sm">
          <Settings2 className="w-4 h-4" />
          Cấu hình nâng cao (Advanced & Limits)
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 [&[data-state=open]>svg]:rotate-180">
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground" />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="p-5 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            name="timeoutMs"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (ms)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Thời gian chờ tối đa cho mỗi request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="cacheTtlSec"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cache TTL (giây)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>Thời gian lưu cache kết quả (0 = tắt cache).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="retry"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cấu hình Retry (JSON)</FormLabel>
                <FormControl>
                  <Input placeholder='{"times": 3, "backoff": 1000}' {...field} />
                </FormControl>
                <FormDescription>Cấu hình thử lại khi gọi API thất bại.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="rateLimit"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Limit (JSON)</FormLabel>
                <FormControl>
                  <Input placeholder='{"windowMs": 60000, "max": 100}' {...field} />
                </FormControl>
                <FormDescription>Giới hạn số lượng request.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="roles"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roles (Phân quyền PBAC)</FormLabel>
                <FormControl>
                  <Input placeholder="admin, system, operator" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>Danh sách role được phép (cách nhau bởi dấu phẩy).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="scopes"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scopes (Phân quyền OAuth2)</FormLabel>
                <FormControl>
                  <Input placeholder="read:users, write:config" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>Danh sách scope được phép (cách nhau bởi dấu phẩy).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
