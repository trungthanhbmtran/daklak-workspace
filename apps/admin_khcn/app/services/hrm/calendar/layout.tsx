"use client";

import React from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Heading } from "@/components/ui/typography";
import { Tabs } from "@/components/ui/tabs";
import { CalendarTabs } from "@/features/hrm/components/calendar/components/CalendarTabs";

export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  // segment will be "all", "personal", "unit", "meeting"
  const activeTab = segment || "all";

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4 lg:p-6 w-full max-w-[1800px] mx-auto h-[calc(100vh-64px)] min-h-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0">
        <Heading level="h1" className="text-foreground flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-primary" />
          Lịch công tác
        </Heading>
      </div>

      <Tabs 
        value={activeTab} 
        className="flex flex-col flex-1 min-h-0 space-y-4" 
        onValueChange={(val) => router.push(`/services/hrm/calendar/${val}`)}
      >
        <div className="shrink-0">
          <CalendarTabs />
        </div>

        <div className="flex flex-col flex-1 min-h-0 relative">
          {children}
        </div>
      </Tabs>
    </div>
  );
}
