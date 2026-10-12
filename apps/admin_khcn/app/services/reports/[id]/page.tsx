"use client";
import React, { use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ReportViewer } from '@/features/reports/components/reports/ReportViewer';
import { RefreshCw } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function ReportDetailPage(props: PageProps) {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();

  let rawId = routeParams?.id;
  if (!rawId && props.params) {
    try {
      const resolved = typeof (props.params as any)?.then === 'function'
        ? use(props.params as Promise<{ id: string }>)
        : (props.params as { id: string });
      rawId = resolved?.id;
    } catch {
      // Fallback to routeParams
    }
  }

  const numId = Number(rawId);

  if (!numId || isNaN(numId)) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs">Đang nạp dữ liệu báo cáo...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white overflow-hidden">
      <ReportViewer
        definitionId={numId}
        onBack={() => router.push('/services/reports')}
      />
    </div>
  );
}
