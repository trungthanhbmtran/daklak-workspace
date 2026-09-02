import { redirect } from "next/navigation";

export const metadata = {
  title: "Lịch công tác | Sở KH&CN Đắk Lắk",
};

export default function HrmCalendarPage() {
  redirect("/services/hrm/calendar/all");
}
