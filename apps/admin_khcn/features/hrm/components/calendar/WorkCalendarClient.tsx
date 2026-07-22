"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { Skeleton } from "@/components/ui/skeleton";

// Tối ưu Code Splitting (Lazy Loading) cho Mobile và Desktop
const DesktopCalendar = dynamic(
  () => import("./components/DesktopCalendar").then(mod => mod.DesktopCalendar), 
  { ssr: false, loading: () => <Skeleton className="w-full min-h-[500px] rounded-xl" /> }
);

const MobileCalendar = dynamic(
  () => import("./components/MobileCalendar").then(mod => mod.MobileCalendar), 
  { ssr: false, loading: () => <Skeleton className="w-full h-[calc(100vh-64px)] rounded-none" /> }
);

export function WorkCalendarClient() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileCalendar /> : <DesktopCalendar />;
}
