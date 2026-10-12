import { ReportViewer } from '@/features/reports/components/reports/ReportViewer';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Chi tiết Báo cáo | Quản trị Hệ thống',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    notFound();
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-white overflow-hidden">
      <ReportViewer definitionId={numId} />
    </div>
  );
}
