import React from 'react';
import { Metadata } from 'next';
import PerformanceDashboardClient from '@/features/hrm/components/performance/evaluations/PerformanceDashboardClient';

export const metadata: Metadata = {
  title: 'Giám sát KPI Tổng thể | Command Center',
  description: 'Trung tâm giám sát hiệu suất, tiến độ công việc và cảnh báo điểm nóng cấp độ Chính phủ/Doanh nghiệp lớn.',
};

export default function KpiDashboardPage() {
  return <PerformanceDashboardClient />;
}
