import { redirect } from "next/navigation";
import { WorkCalendarClient } from "@/features/hrm/components/calendar/WorkCalendarClient";

export const metadata = {
  title: "Lịch công tác | Sở KH&CN Đắk Lắk",
};

interface CalendarTabPageProps {
  params: {
    tab: string;
  };
}

const validTabs = ["all", "personal", "unit", "meeting"];

export default function CalendarTabPage({ params }: CalendarTabPageProps) {
  const { tab } = params;

  if (!validTabs.includes(tab)) {
    redirect("/services/hrm/calendar/all");
  }

  return <WorkCalendarClient activeTab={tab as any} />;
}
