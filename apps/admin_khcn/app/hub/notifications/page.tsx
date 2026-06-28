import React from 'react';
import { Metadata } from 'next';
import { PortalHeader } from '@/features/hub/components/HubClient';
import { NotificationListClient } from '@/features/notifications/NotificationListClient';

export const metadata: Metadata = {
  title: 'Trung tâm Thông báo | Cổng Ứng dụng Nội bộ',
  description: 'Quản lý thông báo toàn hệ thống',
};

export default function GlobalNotificationsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <PortalHeader />
      <main className="container mx-auto py-8 px-4 max-w-6xl flex-1">
        <NotificationListClient />
      </main>
    </div>
  );
}
