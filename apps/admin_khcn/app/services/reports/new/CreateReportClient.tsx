"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ReportDesigner = dynamic(
  () => import('@/features/reports/components/reports/designer/ReportDesigner').then((m) => m.ReportDesigner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full p-6 space-y-4">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
          <Skeleton className="h-full rounded-xl" />
          <Skeleton className="h-full md:col-span-2 rounded-xl" />
        </div>
      </div>
    ),
  }
);
import { useCreateReportDefinition } from '@/features/reports/api';
import { ReportConfigAST } from '@/features/reports/types';
import { toast } from 'sonner';
import { ChevronRight, FileSpreadsheet } from 'lucide-react';

export function CreateReportClient() {
  const router = useRouter();
  const createMutation = useCreateReportDefinition();

  const handleSave = async (config: ReportConfigAST, customName?: string) => {
    try {
      const result = await createMutation.mutateAsync({
        name:
          customName ||
          `Báo cáo mới ${new Date().toLocaleDateString('vi-VN')}`,
        configuration: config,
      });
      toast.success('Tạo cấu hình báo cáo mới thành công!');
      const newId = (result as { id?: string })?.id;
      if (newId) {
        router.push(`/services/reports/${newId}`);
      } else {
        router.push('/services/reports');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo báo cáo. Vui lòng thử lại.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden min-w-0">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-2.5 flex items-center gap-2 text-xs text-slate-500 shadow-xs shrink-0 w-full min-w-0 overflow-x-auto">
        <Link
          href="/services/reports"
          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-medium text-slate-600 shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
          Trung tâm Báo cáo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800 shrink-0">Tạo báo cáo mới</span>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <ReportDesigner
          onSave={handleSave}
          onCancel={() => router.push('/services/reports')}
        />
      </div>
    </div>
  );
}
