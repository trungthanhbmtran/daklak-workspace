import { redirect } from "next/navigation";

export default function HrmRootPage() {
  redirect("/services/hrm/employees");
}
