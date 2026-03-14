"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationRead, type NotificationItem } from "./api";

const NOTIFICATIONS_KEY = ["notifications"];

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={`
        flex flex-col gap-0.5 px-3 py-2.5 border-b border-border/50 last:border-0
        ${item.read ? "bg-muted/20" : "bg-primary/5"}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {!item.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onMarkRead(item.id)}
          >
            <Check className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>
      <span className="text-[10px] text-muted-foreground/80">
        {item.createdAt
          ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })
          : ""}
      </span>
    </div>
  );
}

export function NotificationBell() {
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
  const unreadCount = list.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0 border-border align-end" align="end" sideOffset={8}>
        <div className="border-b px-3 py-2.5 font-medium text-sm text-foreground">
          Thông báo
        </div>
        <ScrollArea className="h-[280px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : list.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Chưa có thông báo
            </div>
          ) : (
            list.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                onMarkRead={(id) => markRead.mutate(id)}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
