import React from 'react';
import { Metadata } from 'next';
import { KpiDashboardClient } from '@/features/hrm/components/kpi/KpiDashboardClient';

export const metadata: Metadata = {
  title: 'Giám sát KPI Tổng thể | Command Center',
  description: 'Trung tâm giám sát hiệu suất, tiến độ công việc và cảnh báo điểm nóng cấp độ Chính phủ/Doanh nghiệp lớn.',
};

export default function KpiDashboardPage() {
  return <KpiDashboardClient />;
}
