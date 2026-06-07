"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { GatewayConfig, gatewayApi } from "../api/gateway.api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { RoutesManager } from "./RoutesManager";

export function GatewayClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<GatewayConfig | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<Partial<GatewayConfig>>();

  const enableHttps = watch("enableHttps");
  const provider = watch("provider");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const configs = await gatewayApi.getGatewayConfigs();
      if (configs && configs.length > 0) {
        const current = configs[0];
        setConfig(current);
        Object.keys(current).forEach((key) => {
          setValue(key as keyof GatewayConfig, (current as any)[key]);
        });
      } else {
        // Init default if none exists
        const newConfig = await gatewayApi.createGatewayConfig({
          name: "Default Gateway",
          provider: "NGINX",
          httpPort: 80,
          httpsPort: 443,
          enableHttps: false,
        });
        setConfig(newConfig);
        Object.keys(newConfig).forEach((key) => {
          setValue(key as keyof GatewayConfig, (newConfig as any)[key]);
        });
      }
    } catch (error) {
      toast.error("Không thể tải cấu hình Gateway");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Partial<GatewayConfig>) => {
    if (!config?.id) return;
    try {
      setSaving(true);
      const updated = await gatewayApi.updateGatewayConfig(config.id, {
        name: data.name,
        provider: data.provider,
        httpPort: Number(data.httpPort),
        httpsPort: Number(data.httpsPort),
        enableHttps: Boolean(data.enableHttps),
        sslCert: data.sslCert,
        sslKey: data.sslKey,
        rawConfig: data.rawConfig,
      });
      setConfig(updated);
      toast.success("Đã lưu cấu hình Gateway");
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'sslCert' | 'sslKey') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          setValue(fieldName, text);
          toast.success(`Đã đọc file ${file.name}`);
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cấu hình API Gateway</h1>
        <p className="text-muted-foreground">
          Quản lý cổng kết nối, SSL và điều hướng dịch vụ trung tâm.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
          <TabsTrigger value="ssl">SSL / HTTPS</TabsTrigger>
          <TabsTrigger value="routes">Điều hướng (Routes)</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* GENERAL SETTINGS */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Thiết lập máy chủ và cổng mạng cơ bản.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên Gateway</Label>
                    <Input {...register("name")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={provider || "NGINX"}
                      onValueChange={(val) => setValue("provider", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGINX">NGINX</SelectItem>
                        <SelectItem value="TRAEFIK">Traefik</SelectItem>
                        <SelectItem value="HAPROXY">HAProxy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>HTTP Port</Label>
                    <Input type="number" {...register("httpPort")} />
                  </div>
                  <div className="space-y-2">
                    <Label>HTTPS Port</Label>
                    <Input type="number" {...register("httpsPort")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cấu hình tuỳ chỉnh (Raw Config)</Label>
                  <Textarea
                    placeholder="server { ... }"
                    className="font-mono min-h-[200px]"
                    {...register("rawConfig")}
                  />
                  <p className="text-xs text-muted-foreground">
                    Đoạn cấu hình này sẽ được nối thêm vào file config chính.
                  </p>
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu cấu hình
              </Button>
            </div>
          </TabsContent>

          {/* SSL SETTINGS */}
          <TabsContent value="ssl">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình SSL / HTTPS</CardTitle>
                <CardDescription>
                  Tải lên hoặc dán nội dung chứng chỉ SSL để bật HTTPS cho Gateway.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={enableHttps}
                    onCheckedChange={(val) => setValue("enableHttps", val)}
                  />
                  <Label>Bật HTTPS</Label>
                </div>

                {enableHttps && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>SSL Certificate (.crt / .pem)</Label>
                      <Input
                        type="file"
                        accept=".crt,.pem,.cer"
                        onChange={(e) => handleFileUpload(e, 'sslCert')}
                      />
                      <Textarea
                        className="font-mono mt-2 h-[300px] text-xs"
                        placeholder="-----BEGIN CERTIFICATE-----..."
                        {...register("sslCert")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SSL Private Key (.key)</Label>
                      <Input
                        type="file"
                        accept=".key,.pem"
                        onChange={(e) => handleFileUpload(e, 'sslKey')}
                      />
                      <Textarea
                        className="font-mono mt-2 h-[300px] text-xs"
                        placeholder="-----BEGIN PRIVATE KEY-----..."
                        {...register("sslKey")}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu cấu hình SSL
              </Button>
            </div>
          </TabsContent>
        </form>

        {/* ROUTES MANAGER */}
        <TabsContent value="routes">
          {config?.id && (
            <RoutesManager
              gatewayId={config.id}
              routes={config.routes || []}
              onRoutesChange={fetchConfig}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
