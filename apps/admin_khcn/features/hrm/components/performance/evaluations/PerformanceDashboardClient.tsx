// src/app/executive-kpi/page.tsx
"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKpiEvaluations } from '../../../hooks';

// Khai báo Dynamic Loading cho các Tab (Tính năng chia nhỏ code - Code Splitting)
const OverviewTab = dynamic(() => import('./OverviewTab'), {
  loading: () => <div className="h-[400px] w-full bg-slate-100/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Đang tải biểu đồ tổng quan...</div>,
  ssr: false // Tắt SSR với Recharts nếu cần thiết để tránh lỗi Hydration
});

const DepartmentsTab = dynamic(() => import('./DepartmentsTab'), {
  loading: () => <div className="h-[400px] w-full bg-slate-100/50 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Đang tải bảng danh sách đơn vị...</div>,
});

export default function PerformanceDashboardClient() {
  const [selectedPeriod, setSelectedPeriod] = useState('Q2-2026');
  const { data, isLoading } = useKpiEvaluations(selectedPeriod);

  const kpiDetails = data?.data?.kpiDetails || [];
  const deptData = data?.data?.deptData || [];
  const trendData = data?.data?.trendData || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sở Khoa học và Công nghệ tỉnh Đắk Lắk</h1>
            <p className="text-sm text-slate-500">Bảng điều khiển Giám sát Hiệu suất Tổng thể (Executive Dashboard)</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[160px] bg-white">
                <Calendar className="mr-2 h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Chọn kỳ đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Q1-2026">Quý 1 / 2026</SelectItem>
                <SelectItem value="Q2-2026">Quý 2 / 2026</SelectItem>
                <SelectItem value="2026">Toàn năm 2026</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Báo cáo
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger value="overview" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Tổng quan Cơ quan
            </TabsTrigger>
            <TabsTrigger value="departments" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Chi tiết Đơn vị trực thuộc
            </TabsTrigger>
          </TabsList>

          {/* Hiển thị mờ khi API đang refetch nhưng không khóa tương tác */}
          <div className={isLoading ? 'opacity-60 transition-opacity' : ''}>
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            <TabsContent value="overview" className="mt-0 space-y-6">
              <OverviewTab kpiDetails={kpiDetails} deptData={deptData} trendData={trendData} />
            </TabsContent>

            {/* TAB 2: DETAILED DATA TABLE */}
            <TabsContent value="departments" className="mt-0">
              <DepartmentsTab kpiDetails={kpiDetails} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}