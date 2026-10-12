"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ReportViewer } from '@/features/reports/components/reports/ReportViewer';

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const numId = Number(id);

  return (
    <div className="w-full min-h-screen flex flex-col bg-white overflow-hidden">
      <ReportViewer
        definitionId={numId}
        onBack={() => router.push('/services/reports')}
      />
    </div>
  );
}
