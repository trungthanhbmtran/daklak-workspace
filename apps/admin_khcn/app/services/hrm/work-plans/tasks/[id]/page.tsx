import { redirect } from 'next/navigation';

export default function TaskRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/services/hrm/work-plans/tasks?taskId=${params.id}`);
}
