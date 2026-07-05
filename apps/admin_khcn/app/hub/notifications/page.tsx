import React from 'react';
import { Metadata } from 'next';
import { NotificationListClient } from '@/features/notifications/NotificationListClient';
import { NotificationConfigPanel } from "@/features/notifications/components/NotificationConfigPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: 'Trung tâm Thông báo | Cổng Ứng dụng Nội bộ',
  description: 'Quản lý thông báo toàn hệ thống',
};

export default async function GlobalNotificationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const defaultTab = tab === 'config' ? 'config' : 'list';

  return (
    <Tabs defaultValue={defaultTab} className="flex-1 min-h-0 flex flex-col overflow-hidden w-full">
      <div className="shrink-0 flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div className="hidden md:block">
        </div>
        <div className="flex w-full md:w-auto justify-center md:justify-end">
          <TabsList className="grid w-64 grid-cols-2">
            <TabsTrigger value="list" className="flex gap-2">
              <Bell className="w-4 h-4" />
              Cá nhân
            </TabsTrigger>
            <TabsTrigger value="config" className="flex gap-2">
              <Settings className="w-4 h-4" />
              Cấu hình
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <TabsContent value="list" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col mt-0 border-none p-0 outline-none overflow-hidden">
        <NotificationListClient />
      </TabsContent>
      <TabsContent value="config" className="flex-1 min-h-0 data-[state=active]:flex data-[state=active]:flex-col mt-0 border-none p-0 outline-none overflow-hidden">
        <NotificationConfigPanel />
      </TabsContent>
    </Tabs>
  );
}
