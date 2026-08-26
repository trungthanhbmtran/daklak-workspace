"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { getNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem } from "./api";
import { useState } from "react";
import { toast } from "sonner";

const NOTIFICATIONS_KEY = ["notifications"];

import { NotificationList } from "./components/NotificationList";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const queryClient = useQueryClient();
  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: ({ pageParam }) => getNotifications({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: open ? 30_000 : false,
  });

  const list = data?.pages.flatMap((page) => page.data) || [];
  // Lấy unreadCount từ backend trả về ở trang đầu tiên
  const unreadCount = data?.pages[0]?.unreadCount ?? 0;

  const markRead = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previousData = queryClient.getQueryData(NOTIFICATIONS_KEY);
      
      queryClient.setQueryData(NOTIFICATIONS_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => ({
            ...page,
            data: page.data.map((item: any) => 
              item.id === id ? { ...item, read: true } : item
            ),
            unreadCount: index === 0 ? Math.max(0, (page.unreadCount || 0) - 1) : page.unreadCount
          }))
        };
      });
      
      return { previousData };
    },
    onError: (error: any, _, context) => { 
      if (context?.previousData) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousData);
      }
      toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); 
    },
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });

  const markAllRead = useMutation({
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previousData = queryClient.getQueryData(NOTIFICATIONS_KEY);
      
      queryClient.setQueryData(NOTIFICATIONS_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) => ({
            ...page,
            data: page.data.map((item: any) => ({ ...item, read: true })),
            unreadCount: index === 0 ? 0 : page.unreadCount
          }))
        };
      });
      
      return { previousData };
    },
    onError: (error: any, _, context) => { 
      if (context?.previousData) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previousData);
      }
      toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); 
    },
    mutationFn: markAllNotificationsRead,
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`relative h-10 w-10 rounded-full shrink-0 transition-colors border-0 ${open ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200'}`}
        >
          <Bell className={`h-[1.3rem] w-[1.3rem] ${open ? 'fill-blue-600 text-blue-600' : 'fill-current text-current'}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#e41e3f] px-1 text-[11px] font-bold text-white ring-2 ring-white animate-in zoom-in">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] sm:w-[380px] p-0 border-border/50 shadow-xl rounded-xl align-end overflow-hidden" align="end" sideOffset={8}>
        <div className="flex flex-col border-b border-border/40 bg-muted/30 px-3 sm:px-4 py-3 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[20px] text-foreground tracking-tight">Thông báo</h4>
              {unreadCount > 0 && (
                <span className="bg-[#e41e3f]/10 text-[#e41e3f] text-[11px] font-semibold px-2 py-0.5 rounded-full mt-0.5">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary hover:bg-transparent"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 -mb-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${filter === 'ALL' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-full text-[14px] font-semibold transition-colors ${filter === 'UNREAD' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              Chưa đọc
            </button>
          </div>
        </div>

        <ScrollArea className="max-h-[75vh] min-h-[300px]">
          {isLoading && list.length === 0 ? (
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
            <NotificationList 
              list={list} 
              filter={filter} 
              onMarkRead={(id) => markRead.mutate(id)} 
              onClick={handleNotificationClick} 
            />
          )}
        </ScrollArea>

        <div className="p-1 sm:p-2 border-t border-border/40 bg-muted/30">
          {hasNextPage ? (
            <Button 
              variant="ghost" 
              className="w-full h-9 text-[13px] font-semibold text-primary hover:text-primary hover:bg-primary/5 rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                fetchNextPage();
              }}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...</>
              ) : (
                "Xem thêm"
              )}
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground py-2 font-medium">Đã hiển thị tất cả thông báo</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
