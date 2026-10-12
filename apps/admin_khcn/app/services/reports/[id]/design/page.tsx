"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ReportDesigner } from '@/features/reports/components/reports/designer/ReportDesigner';
import {
  useGetReportDefinition,
  useCreateReportDefinition,
} from '@/features/reports/api';
import { ReportConfigAST } from '@/features/reports/types';
import { toast } from 'sonner';
import { ChevronRight, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function EditReportDesignPage(props: PageProps) {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();

  let rawId = routeParams?.id;
  if (!rawId && props.params) {
    try {
      const resolved = typeof (props.params as any)?.then === 'function'
        ? React.use(props.params as Promise<{ id: string }>)
        : (props.params as { id: string });
      rawId = resolved?.id;
    } catch {
      // Fallback to routeParams
    }
  }

  const numId = Number(rawId);

  if (!Number.isInteger(numId) || numId <= 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs">Đang nạp cấu hình báo cáo...</span>
      </div>
    );
  }

  const { data: reportDef, isLoading } = useGetReportDefinition(numId);
  const updateMutation = useCreateReportDefinition();

  const handleSave = async (config: ReportConfigAST, customName?: string) => {
    try {
      await updateMutation.mutateAsync({
        id: numId,
        name: customName || reportDef?.name || `Báo cáo #${numId}`,
        description: reportDef?.description,
        configuration: config,
      });
      toast.success('Cập nhật cấu hình và biểu đồ báo cáo thành công!');
      router.push(`/services/reports/${numId}`);
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
            Đang tải cấu hình báo cáo #{numId}...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đang nạp nguồn dữ liệu và các biểu đồ đã thiết kế trước đó.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-2.5 flex items-center gap-2 text-xs text-slate-500 shadow-xs">
        <Link
          href="/services/reports"
          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 font-medium text-slate-600"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
          Trung tâm Báo cáo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link
          href={`/services/reports/${numId}`}
          className="hover:text-indigo-600 transition-colors font-medium text-slate-600 truncate max-w-xs"
        >
          {reportDef?.name || `Báo cáo #${numId}`}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800">Thiết kế lại</span>
      </div>

      <div className="flex-1">
        <ReportDesigner
          reportId={numId}
          reportName={reportDef?.name}
          reportDescription={reportDef?.description}
          initialConfig={reportDef?.configuration}
          onSave={handleSave}
          onCancel={() => router.push(`/services/reports/${numId}`)}
        />
      </div>
    </div>
  );
}
