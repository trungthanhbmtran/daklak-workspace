import { redirect } from "next/navigation";

export default function TasksAdminRedirect() {
  redirect("/services/hrm/tasks");
}
