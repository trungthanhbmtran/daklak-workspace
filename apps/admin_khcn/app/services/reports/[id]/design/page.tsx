import { notFound } from 'next/navigation';
import { EditReportDesignClient } from './EditReportDesignClient';

export const metadata = {
  title: 'Thiết kế Báo cáo | Quản trị Hệ thống',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReportDesignPage({ params }: PageProps) {
  const { id } = await params;
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    notFound();
  }

  return <EditReportDesignClient id={numId} />;
}
