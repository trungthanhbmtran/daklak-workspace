"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, CheckCircle2, AlertTriangle, Info, Clock, Loader2, Filter, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getNotifications, markNotificationRead, type NotificationItem } from "./api";

const NOTIFICATIONS_KEY = ["notifications"];

export function NotificationListClient() {
  const queryClient = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getNotifications,
    refetchInterval: 30_000,
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
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Trung tâm Thông báo</h2>
          <p className="text-slate-500 mt-2">Quản lý và theo dõi toàn bộ thông báo từ tất cả các phân hệ trong hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white" onClick={() => list.filter(n => !n.read).forEach(n => markRead.mutate(n.id))}>
            <Check className="mr-2 h-4 w-4" /> Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Tìm kiếm thông báo..." className="pl-10 bg-slate-50 border-none" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="rounded-full"><Filter className="h-4 w-4 mr-2"/> Lọc</Button>
          <Button variant="secondary" size="sm" className="rounded-full bg-slate-100">Chưa đọc</Button>
          <Button variant="ghost" size="sm" className="rounded-full">Tất cả</Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
          ) : list.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              Không có thông báo nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {list.map((item) => (
                <div key={item.id} className={`p-5 flex gap-4 hover:bg-slate-50 transition-colors ${!item.read ? 'bg-blue-50/50' : 'bg-white'}`}>
                  <div className="mt-1 flex-shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-base font-semibold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>{item.title}</h4>
                        {getPriorityBadge(item.type)}
                        {!item.read && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 gap-1">
                        <Clock className="h-3 w-3" />
                        {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ""}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{item.body}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center justify-center pl-4">
                    {!item.read ? (
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => markRead.mutate(item.id)}>
                        Đánh dấu đã đọc
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Đã đọc</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
