import React from 'react';
import { Metadata } from 'next';
import { SystemSettingsClient } from '../../../../features/system-admin/users/components/SystemSettingsClient';

export const metadata: Metadata = {
  title: 'Cấu hình Hệ thống | Quản trị Hệ thống',
  description: 'Thiết lập cấu hình AI và Dịch thuật cho toàn hệ thống',
};

export default function SystemSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50 min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Cấu hình Hệ thống</h2>
          <p className="text-muted-foreground">
            Quản lý các thông số tích hợp AI và dịch vụ dịch thuật
          </p>
        </div>
      </div>

      <SystemSettingsClient />
    </div>
  );
}
