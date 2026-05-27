import { EmployeeEditClient } from '@/features/hrm/components/EmployeeEditClient';

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return <EmployeeEditClient params={params} />;
}
