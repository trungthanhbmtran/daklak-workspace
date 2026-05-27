import EmployeeEditClient from '@/features/hrm/components/EmployeeEditClient';

export default function EditEmployeePageWrapper({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  // @ts-ignore
  return <EmployeeEditClient params={params as any} />;
}
