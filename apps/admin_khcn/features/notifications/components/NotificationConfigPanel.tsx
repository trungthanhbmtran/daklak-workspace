"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { notificationConfigApi } from "../api";
import { Loader2, BellRing, Mail, MessageCircle, Send, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationConfigPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [inApp, setInApp] = useState(true);
  const [telegram, setTelegram] = useState({ botToken: "" });
  const [zalo, setZalo] = useState({ accessToken: "", apiUrl: "" });
  const [smtp, setSmtp] = useState({ host: "", port: "", secure: false, user: "", password: "", from: "" });

  const [integrationIds, setIntegrationIds] = useState<Record<string, number>>({});
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({
    NOTIFY_INAPP: false,
    NOTIFY_TELEGRAM: false,
    NOTIFY_ZALO: false,
    NOTIFY_SMTP: false,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await notificationConfigApi.list();
      const ids: Record<string, number> = {};
      const states: Record<string, boolean> = {
        NOTIFY_INAPP: false,
        NOTIFY_TELEGRAM: false,
        NOTIFY_ZALO: false,
        NOTIFY_SMTP: false,
      };
      
      res.forEach((item: any) => {
        ids[item.integrationCode] = item.id;
        states[item.integrationCode] = item.isActive;
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
      setActiveStates(states);
    } catch (error) {
      toast.error("Không thể lấy cấu hình thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (code: string, systemName: string, configData: any, isActive: boolean) => {
    try {
      setSaving(true);
      const id = integrationIds[code];
      const body = {
        systemName,
        integrationCode: code,
        isActive,
        configData
      };
      
      if (id) {
        await notificationConfigApi.update(id, body);
      } else {
        await notificationConfigApi.create(body);
      }
      toast.success(`Đã lưu cấu hình ${systemName}`);
      await fetchConfigs();
    } catch (error) {
      toast.error(`Lỗi khi lưu cấu hình ${systemName}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (code: string, systemName: string, configData: any, currentActive: boolean) => {
    const newState = !currentActive;
    setActiveStates(prev => ({ ...prev, [code]: newState }));
    try {
      const id = integrationIds[code];
      if (id) {
        // Just update active state if it exists
        const res = await notificationConfigApi.update(id, {
          systemName,
          integrationCode: code,
          isActive: newState,
          configData
        });
        toast.success(`Đã ${newState ? 'bật' : 'tắt'} ${systemName}`);
      } else {
        // Create if not exists
        await handleSave(code, systemName, configData, newState);
      }
    } catch (err) {
      // Revert on error
      setActiveStates(prev => ({ ...prev, [code]: currentActive }));
      toast.error("Có lỗi xảy ra khi thay đổi trạng thái!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
        <p className="text-slate-500 font-medium">Đang tải cấu hình thông báo...</p>
      </div>
    );
  }

  const channels = [
    {
      id: "NOTIFY_INAPP",
      name: "Thông báo In-App",
      description: "Hiển thị thông báo trực tiếp trên giao diện web (Quả chuông) theo thời gian thực.",
      icon: BellRing,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
      config: null,
      stateData: {},
    },
    {
      id: "NOTIFY_TELEGRAM",
      name: "Telegram Bot",
      description: "Gửi cảnh báo và tin nhắn qua Telegram Bot. Yêu cầu Chat ID để nhận tin nhắn.",
      icon: Send,
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-500/10",
      stateData: telegram,
      config: (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <Label htmlFor="telegram-token" className="text-slate-700 dark:text-slate-300">Bot Token</Label>
            <Input 
              id="telegram-token" 
              placeholder="Ví dụ: 123456789:ABCDefghIJKLmnopQRSTuvwxyz" 
              value={telegram.botToken}
              onChange={(e) => setTelegram({...telegram, botToken: e.target.value})}
              className="bg-white/50 dark:bg-slate-900/50"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSave("NOTIFY_TELEGRAM", "Telegram Bot", telegram, activeStates["NOTIFY_TELEGRAM"])} disabled={saving} className="bg-sky-500 hover:bg-sky-600">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu cấu hình Telegram
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "NOTIFY_SMTP",
      name: "Email SMTP",
      description: "Gửi thư điện tử qua máy chủ SMTP ngoại vi (Google, Outlook, v.v).",
      icon: Mail,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-500/10",
      stateData: smtp,
      config: (
        <div className="grid gap-4 md:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">Máy chủ SMTP (Host)</Label>
            <Input id="smtp-host" placeholder="smtp.gmail.com" value={smtp.host} onChange={(e) => setSmtp({...smtp, host: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-port">Cổng (Port)</Label>
            <Input id="smtp-port" placeholder="465" value={smtp.port} onChange={(e) => setSmtp({...smtp, port: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Tài khoản (Username)</Label>
            <Input id="smtp-user" placeholder="email@example.com" value={smtp.user} onChange={(e) => setSmtp({...smtp, user: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-pass">Mật khẩu (App Password)</Label>
            <Input id="smtp-pass" type="password" value={smtp.password} onChange={(e) => setSmtp({...smtp, password: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="smtp-from">Gửi từ (From Email)</Label>
            <Input id="smtp-from" placeholder="Hệ thống HRM <noreply@example.com>" value={smtp.from} onChange={(e) => setSmtp({...smtp, from: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="flex items-center space-x-2 md:col-span-2 mt-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <Switch id="smtp-secure" checked={smtp.secure} onCheckedChange={(v) => setSmtp({...smtp, secure: v})} />
            <Label htmlFor="smtp-secure" className="cursor-pointer">Bật mã hóa SSL/TLS (Secure Connection)</Label>
          </div>
          <div className="flex justify-end pt-2 md:col-span-2">
            <Button onClick={() => handleSave("NOTIFY_SMTP", "Email SMTP", smtp, activeStates["NOTIFY_SMTP"])} disabled={saving} className="bg-rose-500 hover:bg-rose-600 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu cấu hình Email
            </Button>
          </div>
        </div>
      )
    },
    {
      id: "NOTIFY_ZALO",
      name: "Zalo ZNS / OA",
      description: "Gửi tin nhắn ZNS hoặc Zalo OA tới khách hàng thông qua Zalo Cloud API.",
      icon: MessageCircle,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
      stateData: zalo,
      config: (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <Label htmlFor="zalo-token">Access Token Zalo OA</Label>
            <Input id="zalo-token" placeholder="Zalo OA Access Token..." value={zalo.accessToken} onChange={(e) => setZalo({...zalo, accessToken: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zalo-api">API URL (Tùy chọn)</Label>
            <Input id="zalo-api" placeholder="https://openapi.zalo.me/v2.0/oa/message" value={zalo.apiUrl} onChange={(e) => setZalo({...zalo, apiUrl: e.target.value})} className="bg-white/50 dark:bg-slate-900/50" />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSave("NOTIFY_ZALO", "Zalo ZNS / OA", zalo, activeStates["NOTIFY_ZALO"])} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu cấu hình Zalo
            </Button>
          </div>
        </div>
      )
    }
  ];
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar w-full animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto pb-10">
        <div className="w-full">
          {/* Channels List */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-50 dark:bg-slate-900/50">
          {channels.map((channel) => {
            const isExpanded = expandedId === channel.id;
            const isActive = activeStates[channel.id];

            return (
              <div 
                key={channel.id} 
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 shadow-sm",
                  isActive ? "border-violet-200 dark:border-violet-800" : "border-slate-200 dark:border-slate-800",
                  isExpanded ? "ring-2 ring-violet-500/20 shadow-md" : "hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                {/* Card Header (Always visible) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 md:p-6 cursor-pointer" onClick={() => channel.config && setExpandedId(isExpanded ? null : channel.id)}>
                  <div className={cn("w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border shadow-inner transition-colors", channel.bg, isActive ? "border-transparent" : "border-slate-100 dark:border-slate-800 opacity-50")}>
                    <channel.icon className={cn("w-7 h-7", isActive ? channel.color : "text-slate-400")} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{channel.name}</h3>
                      {isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                          Đã Bật
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Đã Tắt
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-3xl">
                      {channel.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 mt-4 sm:mt-0" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <Label htmlFor={`switch-${channel.id}`} className="text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                        {isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                      </Label>
                      <Switch 
                        id={`switch-${channel.id}`} 
                        checked={isActive} 
                        onCheckedChange={() => toggleActive(channel.id, channel.name, channel.stateData, isActive)} 
                        className="data-[state=checked]:bg-violet-600"
                      />
                    </div>
                    {channel.config && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("rounded-full w-8 h-8 transition-transform duration-200", isExpanded ? "rotate-180 bg-slate-100 dark:bg-slate-800" : "")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : channel.id);
                        }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expandable Configuration Area */}
                {isExpanded && channel.config && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8 rounded-b-2xl">
                    {channel.config}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
  );
}
