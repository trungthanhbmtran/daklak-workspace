"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Loader2, Shield, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { gatewayApi } from "../api/gateway.api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const gatewaySettingsSchema = z.object({
  globalTimeout: z.coerce.number().min(1000).max(60000),
  enableRateLimiting: z.boolean(),
  defaultRateLimit: z.coerce.number().min(10).max(10000),
  enableCors: z.boolean(),
  allowedOrigins: z.string().min(1),
  logLevel: z.enum(["debug", "info", "warn", "error"]),
});

type GatewaySettingsValues = z.infer<typeof gatewaySettingsSchema>;

export function SettingsTab() {
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["gateway", "settings"],
    queryFn: gatewayApi.getSettings,
  });

  const form = useForm<any>({
    resolver: zodResolver(gatewaySettingsSchema) as any,
    defaultValues: {
      globalTimeout: 30000,
      enableRateLimiting: true,
      defaultRateLimit: 100,
      enableCors: true,
      allowedOrigins: "*",
      logLevel: "info",
    },
    values: currentSettings, 
  });

  const mutation = useMutation({
    mutationFn: gatewayApi.updateSettings,
    onSuccess: () => {
      toast.success("Đã lưu cấu hình Gateway thành công!");
    },
    onError: () => {
      toast.error("Không thể lưu cấu hình, vui lòng thử lại.");
    },
  });

  const onSubmit = (values: GatewaySettingsValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 pb-10 min-w-0">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto w-full min-w-0">
          
          <div className="flex items-center justify-between min-w-0">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-foreground truncate">Cấu hình Global Gateway</h2>
              <p className="text-sm text-muted-foreground truncate">Quản lý các thiết lập chung cho toàn bộ luồng request đi qua API Gateway.</p>
            </div>
            <Button type="submit" disabled={mutation.isPending} className="shrink-0 bg-primary hover:bg-primary/90">
              {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Lưu cấu hình
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            <Card className="shadow-sm border-border">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" /> Timeout & Logging
                </CardTitle>
                <CardDescription>Thiết lập thời gian chờ tối đa và cấp độ ghi log hệ thống.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FormField
                  control={form.control}
                  name="globalTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Global Timeout (ms)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormDescription>Thời gian chờ tối đa trước khi Gateway hủy request (1000 - 60000ms).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="logLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức độ Log (Log Level)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn log level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="debug">Debug (Chi tiết nhất)</SelectItem>
                          <SelectItem value="info">Info (Thông tin chung)</SelectItem>
                          <SelectItem value="warn">Warning (Cảnh báo)</SelectItem>
                          <SelectItem value="error">Error (Chỉ ghi lỗi)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" /> Security & Rate Limit
                </CardTitle>
                <CardDescription>Bảo vệ API Gateway khỏi các đợt tấn công quá tải.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FormField
                  control={form.control}
                  name="enableRateLimiting"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5 min-w-0 pr-4">
                        <FormLabel className="text-base truncate">Bật Rate Limiting</FormLabel>
                        <FormDescription className="truncate">Kiểm soát số lượng request từ một IP cụ thể.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enableRateLimiting") && (
                  <FormField
                    control={form.control}
                    name="defaultRateLimit"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel>Giới hạn Request (req/phút)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>Số lượng request tối đa một Client được phép gửi trong vòng 1 phút.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border md:col-span-2">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-500" /> Cross-Origin Resource Sharing (CORS)
                </CardTitle>
                <CardDescription>Quản lý quyền truy cập từ các domain khác nhau.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FormField
                  control={form.control}
                  name="enableCors"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5 min-w-0 pr-4">
                        <FormLabel className="text-base truncate">Kích hoạt CORS</FormLabel>
                        <FormDescription className="truncate">Bật cơ chế CORS cho toàn bộ Gateway.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enableCors") && (
                  <FormField
                    control={form.control}
                    name="allowedOrigins"
                    render={({ field }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-2">
                        <FormLabel>Allowed Origins</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ví dụ: https://domain1.com, https://domain2.com hoặc *" />
                        </FormControl>
                        <FormDescription>Danh sách các domain được phép gọi API (phân cách bằng dấu phẩy). Dùng &quot;*&quot; để cho phép tất cả.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
