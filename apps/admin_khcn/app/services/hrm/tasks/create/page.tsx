import { redirect } from 'next/navigation';

export default function CreateTaskRedirect() {
  redirect('/services/hrm/plans/create');
}
