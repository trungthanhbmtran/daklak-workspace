import React from 'react';
import { Metadata } from 'next';
import { NotificationsClient } from '@/features/notifications/NotificationsClient';

export const metadata: Metadata = {
  title: 'Trung tâm Thông báo | Cổng Ứng dụng Nội bộ',
  description: 'Quản lý thông báo toàn hệ thống',
};

export default async function GlobalNotificationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const defaultTab = tab === 'config' ? 'config' : 'list';

  return <NotificationsClient defaultTab={defaultTab} />;
}

