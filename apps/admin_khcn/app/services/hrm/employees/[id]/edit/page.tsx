/* eslint-disable @typescript-eslint/no-explicit-any */
import EmployeeEditClient from '@/features/hrm/components/EmployeeEditClient';

export default function EditEmployeePageWrapper({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <EmployeeEditClient params={params as any} />;
}
