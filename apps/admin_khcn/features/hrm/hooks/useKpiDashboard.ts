import { useState, useMemo } from 'react';

export type TimeFilter = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'YEAR';

export interface KpiMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  name: string;
  [key: string]: any;
}

export interface DepartmentRanking {
  id: string;
  name: string;
  score: number;
  completedTasks: number;
  totalTasks: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export function useKpiDashboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('YEAR');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for top metrics
  const topMetrics = useMemo<KpiMetric[]>(() => {
    return [
      { title: 'Tổng Kế hoạch / Nhiệm vụ', value: '124,592', change: 12.5, trend: 'up' },
      { title: 'Tỷ lệ Hoàn thành Chung', value: '87.4%', change: 2.1, trend: 'up' },
      { title: 'Nhân sự tham gia', value: '15,420', change: 0.5, trend: 'up' },
      { title: 'Cảnh báo rủi ro (Trễ hạn)', value: '3,102', change: -5.4, trend: 'down' }, // Down is good for risks
    ];
  }, [timeFilter]);

  // Mock data for Line Chart (Trend over months)
  const performanceTrend = useMemo<ChartData[]>(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    return months.map(m => ({
      name: m,
      'Mục tiêu': Math.floor(Math.random() * 20) + 80,
      'Thực tế': Math.floor(Math.random() * 30) + 70,
    }));
  }, [timeFilter]);

  // Mock data for Bar Chart (Department Comparison)
  const departmentScores = useMemo<ChartData[]>(() => {
    return [
      { name: 'Sở Kế hoạch', score: 95 },
      { name: 'Sở Tài chính', score: 92 },
      { name: 'Sở Y tế', score: 85 },
      { name: 'Sở Giáo dục', score: 88 },
      { name: 'Sở GTVT', score: 78 },
      { name: 'UBND TP', score: 90 },
    ];
  }, [timeFilter]);

  // Mock data for Pie Chart (Task Status Distribution)
  const taskDistribution = useMemo<ChartData[]>(() => {
    return [
      { name: 'Hoàn thành đúng hạn', value: 85000, color: '#10b981' },
      { name: 'Đang xử lý (Trong hạn)', value: 25000, color: '#3b82f6' },
      { name: 'Chưa bắt đầu', value: 10000, color: '#94a3b8' },
      { name: 'Trễ hạn / Cảnh báo', value: 4592, color: '#ef4444' },
    ];
  }, [timeFilter]);

  // Mock data for Rankings
  const rankings = useMemo<DepartmentRanking[]>(() => {
    return [
      { id: '1', name: 'Sở Kế hoạch và Đầu tư', score: 96.5, completedTasks: 4500, totalTasks: 4600, status: 'excellent' },
      { id: '2', name: 'Sở Tài chính', score: 94.2, completedTasks: 3800, totalTasks: 4000, status: 'excellent' },
      { id: '3', name: 'UBND Thành phố Buôn Ma Thuột', score: 91.0, completedTasks: 8500, totalTasks: 9200, status: 'good' },
      { id: '4', name: 'Sở Thông tin và Truyền thông', score: 88.5, completedTasks: 2100, totalTasks: 2400, status: 'good' },
      { id: '5', name: 'Sở Giao thông Vận tải', score: 76.4, completedTasks: 3100, totalTasks: 4200, status: 'warning' },
      { id: '6', name: 'UBND Huyện Lắk', score: 65.2, completedTasks: 1200, totalTasks: 2100, status: 'critical' },
    ];
  }, [timeFilter]);

  // Simulate API fetch delay when filter changes
  const handleFilterChange = (filter: TimeFilter) => {
    setIsLoading(true);
    setTimeFilter(filter);
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return {
    timeFilter,
    isLoading,
    handleFilterChange,
    topMetrics,
    performanceTrend,
    departmentScores,
    taskDistribution,
    rankings
  };
}
