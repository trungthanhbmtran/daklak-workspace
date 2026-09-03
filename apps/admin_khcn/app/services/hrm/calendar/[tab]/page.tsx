import { redirect } from "next/navigation";
import { WorkCalendarClient } from "@/features/hrm/components/calendar/WorkCalendarClient";

export const metadata = {
  title: "Lịch công tác | Sở KH&CN Đắk Lắk",
};

interface CalendarTabPageProps {
  params: Promise<{
    tab: string;
  }>;
}

const validTabs = ["all", "personal", "unit", "meeting"];

export default async function CalendarTabPage({ params }: CalendarTabPageProps) {
  const resolvedParams = await params;
  const { tab } = resolvedParams;

  if (!validTabs.includes(tab)) {
    redirect("/services/hrm/calendar/all");
  }

  return <WorkCalendarClient activeTab={tab as any} />;
}
