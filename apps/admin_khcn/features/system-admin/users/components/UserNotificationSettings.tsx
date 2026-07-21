/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { userApi, notificationApi } from "../api";
import type { UserDetail } from "../types";

interface UserNotificationSettingsProps {
  user: UserDetail;
}

export function UserNotificationSettings({ user }: UserNotificationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventsTree, setEventsTree] = useState<any[]>([]);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [events, userDetail] = await Promise.all([
        notificationApi.getEvents(),
        userApi.getOne(user.id),
      ]);
      setEventsTree(events || []);

      const p = (userDetail as any).notificationPrefs || (userDetail as any).notification_prefs;
      if (p) {
        try {
          const parsed = typeof p === 'string' ? JSON.parse(p) : p;
          setPrefs(parsed || {});
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (e) {
          setPrefs({});
        }
      } else {
        // Mặc định bật tất cả nếu chưa cấu hình
        const defaultPrefs: Record<string, boolean> = {};
        events.forEach((s: any) => {
          s.modules?.forEach((m: any) => {
            m.actions?.forEach((a: any) => {
              defaultPrefs[a.eventCode] = true;
            });
          });
        });
        setPrefs(defaultPrefs);
      }
     
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Không thể tải cấu hình thông báo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userApi.updateNotificationPrefs(user.id, prefs);
      toast.success("Đã lưu tùy chọn nhận thông báo cá nhân");
     
    } catch (error) {
      toast.error((error as any)?.response?.data?.message || "Lỗi khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = (eventCode: string, checked: boolean) => {
    setPrefs(prev => ({ ...prev, [eventCode]: checked }));
  };

  const toggleModule = (module: any, checked: boolean) => {
    const newPrefs = { ...prefs };
    module.actions?.forEach((a: any) => {
      newPrefs[a.eventCode] = checked;
    });
    setPrefs(newPrefs);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg">Tùy chọn nhận thông báo</CardTitle>
        <CardDescription>
          Cấu hình các sự kiện hệ thống mà người dùng muốn nhận thông báo (qua Email, Telegram, Zalo, In-App).
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {eventsTree.map((service, sIdx) => (
          <div key={sIdx} className="space-y-4">
            <h4 className="font-semibold text-primary border-b pb-2">{service.serviceName}</h4>
            <div className="grid gap-6">
              {service.modules?.map((module: any, mIdx: number) => {
                const allChecked = module.actions?.every((a: any) => prefs[a.eventCode] !== false);
                return (
                  <div key={mIdx} className="bg-muted/30 p-4 rounded-md border">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id={`mod-${service.service}-${module.module}`}
                        checked={allChecked}
                        onCheckedChange={(c) => toggleModule(module, !!c)}
                      />
                      <Label htmlFor={`mod-${service.service}-${module.module}`} className="font-semibold text-base cursor-pointer">
                        {module.moduleName}
                      </Label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      {module.actions?.map((action: any, aIdx: number) => (
                        <div key={aIdx} className="flex items-center space-x-2">
                          <Checkbox
                            id={`act-${action.eventCode}`}
                            checked={prefs[action.eventCode] !== false}
                            onCheckedChange={(c) => toggleEvent(action.eventCode, !!c)}
                          />
                          <Label htmlFor={`act-${action.eventCode}`} className="cursor-pointer font-normal">
                            {action.actionName}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="px-0 justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu Tùy Chọn
        </Button>
      </CardFooter>
    </Card>
  );
}
