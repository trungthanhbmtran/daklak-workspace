import React from 'react';
import { Metadata } from 'next';
import { SystemSettingsClient } from '../../../../features/system-admin/users/components/SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Cấu hình Hệ thống | Quản trị Hệ thống',
  description: 'Thiết lập cấu hình AI và Dịch thuật cho toàn hệ thống',
};

export default function SystemSettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 pb-10">
      <SystemSettingsClient />
    </div>
  );
}
