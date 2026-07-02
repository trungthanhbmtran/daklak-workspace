import React from 'react';
import { Metadata } from 'next';
import { PortalHeader } from '@/features/hub/components/HubClient';
import { NotificationListClient } from '@/features/notifications/NotificationListClient';
import { NotificationConfigPanel } from "@/features/system-admin/notifications/components/NotificationConfigPanel";
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
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <PortalHeader />
      <main className="container mx-auto py-8 px-4 max-w-6xl flex-1">
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="hidden md:block">
              {/* Header texts removed here since NotificationListClient already has a header.
                  Wait, NotificationConfigPanel might also have its own header.
                  Let's see if we should rely on their internal headers.
                  Actually, NotificationListClient has its own: "Trung tâm Thông báo" and description.
              */}
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
          
          <TabsContent value="list" className="mt-0 border-none p-0 outline-none">
            <NotificationListClient />
          </TabsContent>
          <TabsContent value="config" className="mt-0 border-none p-0 outline-none">
            <NotificationConfigPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
