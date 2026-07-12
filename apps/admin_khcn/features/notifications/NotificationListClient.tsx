"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, AlertTriangle, Info, Clock, Loader2, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getNotifications, markNotificationRead, type NotificationItem } from "./api";
import Link from "next/link";

const NOTIFICATIONS_KEY = ["notifications"];

const resolveHref = (item: NotificationItem) => {
  const { module, type, id, link } = item.metadata || {};
  if (module && type && id) return `/services/${module}/${type}/${id}`;
  if (link) return link;
  return "#";
};

export function NotificationListClient() {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getNotifications,
    refetchInterval: 60_000,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const getIcon = (type?: string) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'DANGER': return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityBadge = (type?: string) => {
    switch (type) {
      case 'WARNING': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Cảnh báo</Badge>;
      case 'DANGER': return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">Khẩn cấp</Badge>;
      case 'SUCCESS': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Thành công</Badge>;
      default: return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Thông tin</Badge>;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden pb-4">
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Trung tâm Thông báo</h2>
          <p className="text-muted-foreground mt-2">Quản lý và theo dõi toàn bộ thông báo từ tất cả các phân hệ trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-background" onClick={() => list.filter(n => !n.read).forEach(n => markRead.mutate(n.id))}>
            <Check className="mr-2 h-4 w-4" /> Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Tìm kiếm thông báo..." className="pl-10 bg-background border-none" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full"><Filter className="h-4 w-4 mr-2"/> Lọc</Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-muted">Chưa đọc</Button>
          <Button variant="ghost" size="sm" className="rounded-full">Tất cả</Button>
        </div>
      </div>

      <Card className="flex-1 min-h-0 flex flex-col border-border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Không có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {list.map((item) => {
                const href = resolveHref(item);
                const isLink = href !== "#";

                const content = (
                  <div className={`p-5 flex gap-4 transition-colors ${!item.read ? 'bg-primary/5 hover:bg-primary/10' : 'bg-card hover:bg-muted/50'}`}>
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-semibold ${!item.read ? 'text-foreground' : 'text-muted-foreground'}`}>{item.title}</h4>
                          {getPriorityBadge(item.type)}
                          {!item.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0"></span>}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-1 shrink-0">
                          <Clock className="h-3 w-3" />
                          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ""}
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80">{item.body}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center pl-4">
                      {!item.read ? (
                        <Button variant="outline" size="sm" className="text-xs relative z-10" onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markRead.mutate(item.id);
                        }}>
                          Đánh dấu đã đọc
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Đã đọc</span>
                      )}
                    </div>
                  </div>
                );

                return isLink ? (
                  <Link key={item.id} href={href} className="block cursor-pointer" onClick={() => !item.read && markRead.mutate(item.id)}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.id}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
