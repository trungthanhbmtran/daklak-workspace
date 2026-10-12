"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReportDesigner } from '@/features/reports/components/reports/designer/ReportDesigner';
import {
  useGetReportDefinition,
  useCreateReportDefinition,
} from '@/features/reports/api';
import { ReportConfigAST } from '@/features/reports/types';
import { toast } from 'sonner';
import { ChevronRight, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface EditReportDesignClientProps {
  id: number;
}

export function EditReportDesignClient({ id }: EditReportDesignClientProps) {
  const router = useRouter();
  const { data: reportDef, isLoading } = useGetReportDefinition(id);
  const updateMutation = useCreateReportDefinition();

  const handleSave = async (config: ReportConfigAST, customName?: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        name: customName || reportDef?.name || `Báo cáo #${id}`,
        description: reportDef?.description,
        configuration: config,
      });
      toast.success('Cập nhật cấu hình và biểu đồ báo cáo thành công!');
      router.push(`/services/reports/${id}`);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu cấu hình báo cáo.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col items-center max-w-sm">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            Đang tải cấu hình báo cáo #{id}...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đang nạp nguồn dữ liệu và các biểu đồ đã thiết kế trước đó.
          </p>
        </div>
      </div>
    );
  }

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
        <Link
          href={`/services/reports/${id}`}
          className="hover:text-indigo-600 transition-colors font-medium text-slate-600 truncate max-w-xs shrink-0"
        >
          {reportDef?.name || `Báo cáo #${id}`}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-800 shrink-0">Thiết kế lại</span>
      </div>

      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <ReportDesigner
          reportId={id}
          reportName={reportDef?.name}
          reportDescription={reportDef?.description}
          initialConfig={reportDef?.configuration}
          onSave={handleSave}
          onCancel={() => router.push(`/services/reports/${id}`)}
        />
      </div>
    </div>
  );
}
