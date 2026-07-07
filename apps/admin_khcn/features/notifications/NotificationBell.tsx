"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2, Calendar, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { getNotifications, markNotificationRead, type NotificationItem } from "./api";
import { useState } from "react";

const NOTIFICATIONS_KEY = ["notifications"];

function NotificationRow({
  item,
  onMarkRead,
  onClick,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onClick: (item: NotificationItem) => void;
}) {
  const resolveHref = (item: NotificationItem) => {
    const { module, type, id, link } = item.metadata || {};
    if (module && type && id) return `/services/${module}/${type}/${id}`;
    if (link) return link;
    return "#";
  };
  const href = resolveHref(item);

  const content = (
    <div
      className={`
        group relative flex gap-3 px-3 sm:px-4 py-3 border-b border-border/40 last:border-0 cursor-pointer
        transition-colors hover:bg-muted/50
        ${item.read ? "bg-transparent" : "bg-muted/10"}
      `}
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${item.read ? 'bg-muted/50 border-border text-muted-foreground' : 'bg-primary/10 border-primary/20 text-primary'}`}>
        {item.type === 'SYSTEM' ? <FileText className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      </div>
      <div className="flex flex-1 flex-col gap-1 pr-6">
        <p className={`text-sm ${item.read ? 'font-medium text-foreground/80' : 'font-semibold text-foreground'}`}>
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {item.body}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground/70">
          <Calendar className="h-3 w-3" />
          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ""}
        </div>
      </div>
      {!item.read && (
        <div className="absolute right-3 sm:right-4 top-4 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary group-hover:hidden shadow-sm" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden group-hover:flex shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(item.id);
            }}
            title="Đánh dấu đã đọc"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (href === "#") {
    return <div onClick={() => onClick(item)}>{content}</div>;
  }

  return (
    <Link href={href} prefetch={true} onClick={() => onClick(item)} className="block">
      {content}
    </Link>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
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

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markRead.mutate(item.id);
    }
    setOpen(false);
  };

  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full bg-background shrink-0">
          <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground ring-2 ring-background animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] sm:w-[380px] p-0 border-border/50 shadow-xl rounded-xl align-end overflow-hidden" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-3 sm:px-4 py-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm text-foreground">Thông báo</h4>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary hover:bg-transparent"
              onClick={() => {
                const unreadItems = list.filter(n => !n.read);
                unreadItems.forEach(n => markRead.mutate(n.id));
              }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
              <p className="text-xs">Đang tải thông báo...</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Bell className="h-5 w-5 opacity-50" />
              </div>
              <p className="text-sm">Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {list.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-1 sm:p-2 border-t border-border/40 bg-muted/30">
          <Link href="/hub/notifications" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full h-9 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5 rounded-lg">
              Xem tất cả thông báo <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
