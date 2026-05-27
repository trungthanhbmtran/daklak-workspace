import { EmployeeDetailClient } from '@/features/hrm/components/EmployeeDetailClient';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return <EmployeeDetailClient params={params} />;
}
