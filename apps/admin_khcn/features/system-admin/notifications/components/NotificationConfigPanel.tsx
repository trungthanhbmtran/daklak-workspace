"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { integrationApi } from "../../users/api";
import { Loader2 } from "lucide-react";

export function NotificationConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [inApp, setInApp] = useState(true);
  const [telegram, setTelegram] = useState({ botToken: "" });
  const [zalo, setZalo] = useState({ accessToken: "", apiUrl: "" });
  const [smtp, setSmtp] = useState({ host: "", port: "", secure: false, user: "", password: "", from: "" });

  const [integrationIds, setIntegrationIds] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await integrationApi.list();
      const ids: Record<string, number> = {};
      
      res.forEach((item: any) => {
        ids[item.integrationCode] = item.id;
        const config = item.configData || {};
        
        switch (item.integrationCode) {
          case "NOTIFY_INAPP":
            setInApp(item.isActive);
            break;
          case "NOTIFY_TELEGRAM":
            setTelegram({ botToken: config.botToken || "" });
            break;
          case "NOTIFY_ZALO":
            setZalo({ accessToken: config.accessToken || "", apiUrl: config.apiUrl || "" });
            break;
          case "NOTIFY_SMTP":
            setSmtp({
              host: config.host || "",
              port: config.port || "",
              secure: config.secure || false,
              user: config.user || "",
              password: config.password || "",
              from: config.from || "",
            });
            break;
        }
      });
      setIntegrationIds(ids);
    } catch (error) {
      toast.error("Không thể lấy cấu hình thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payloads = [
        {
          code: "NOTIFY_INAPP",
          systemName: "Thông báo In-App",
          isActive: inApp,
          configData: {}
        },
        {
          code: "NOTIFY_TELEGRAM",
          systemName: "Telegram Bot",
          isActive: !!telegram.botToken,
          configData: telegram
        },
        {
          code: "NOTIFY_ZALO",
          systemName: "Zalo ZNS / OA",
          isActive: !!zalo.accessToken,
          configData: zalo
        },
        {
          code: "NOTIFY_SMTP",
          systemName: "Email SMTP",
          isActive: !!smtp.host,
          configData: smtp
        }
      ];

      for (const p of payloads) {
        const id = integrationIds[p.code];
        const body = {
          systemName: p.systemName,
          integrationCode: p.code,
          isActive: p.isActive,
          configData: p.configData
        };
        
        if (id) {
          await integrationApi.update(id, body);
        } else {
          await integrationApi.create(body);
        }
      }
      
      toast.success("Cập nhật cấu hình thông báo thành công");
      await fetchConfigs(); // Refresh IDs if new ones were created
    } catch (error) {
      toast.error("Lỗi khi lưu cấu hình thông báo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>Cấu hình thông báo trực tiếp trên giao diện web (Quả chuông).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch id="inapp-active" checked={inApp} onCheckedChange={setInApp} />
            <Label htmlFor="inapp-active">Kích hoạt thông báo In-App</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telegram Bot</CardTitle>
          <CardDescription>Gửi thông báo qua Telegram Bot. Bot cần được thêm vào group hoặc user cần chat với bot trước để lấy Chat ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegram-token">Bot Token</Label>
            <Input 
              id="telegram-token" 
              placeholder="Ví dụ: 123456789:ABCDefghIJKLmnopQRSTuvwxyz" 
              value={telegram.botToken}
              onChange={(e) => setTelegram({...telegram, botToken: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email SMTP</CardTitle>
          <CardDescription>Cấu hình máy chủ gửi thư điện tử (SMTP).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">Host</Label>
            <Input id="smtp-host" placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp({...smtp, host: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">Port</Label>
            <Input id="smtp-port" placeholder="465" value={smtp.port} onChange={(e) => setSmtp({...smtp, port: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Username</Label>
            <Input id="smtp-user" placeholder="email@example.com" value={smtp.user} onChange={(e) => setSmtp({...smtp, user: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-pass">Password / App Password</Label>
            <Input id="smtp-pass" type="password" value={smtp.password} onChange={(e) => setSmtp({...smtp, password: e.target.value})} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="smtp-from">Gửi từ (From Email)</Label>
            <Input id="smtp-from" placeholder="Hệ thống HRM <noreply@example.com>" value={smtp.from} onChange={(e) => setSmtp({...smtp, from: e.target.value})} />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2 mt-2">
            <Switch id="smtp-secure" checked={smtp.secure} onCheckedChange={(v) => setSmtp({...smtp, secure: v})} />
            <Label htmlFor="smtp-secure">Bật SSL/TLS (Secure)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zalo OA</CardTitle>
          <CardDescription>Cấu hình Zalo Official Account / ZNS API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zalo-token">Access Token</Label>
            <Input id="zalo-token" placeholder="Zalo OA Access Token..." value={zalo.accessToken} onChange={(e) => setZalo({...zalo, accessToken: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zalo-api">API URL</Label>
            <Input id="zalo-api" placeholder="https://openapi.zalo.me/v2.0/oa/message" value={zalo.apiUrl} onChange={(e) => setZalo({...zalo, apiUrl: e.target.value})} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu Cấu Hình
        </Button>
      </div>
    </div>
  );
}
