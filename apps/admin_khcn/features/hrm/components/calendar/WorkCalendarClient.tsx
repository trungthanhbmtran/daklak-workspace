"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Tối ưu Code Splitting (Lazy Loading) cho Mobile và Desktop
const DesktopCalendar = dynamic(
  () => import("./components/DesktopCalendar").then(mod => mod.DesktopCalendar), 
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center min-h-[500px]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div> }
);

const MobileCalendar = dynamic(
  () => import("./components/MobileCalendar").then(mod => mod.MobileCalendar), 
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center min-h-[500px]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div> }
);

export function WorkCalendarClient() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileCalendar /> : <DesktopCalendar />;
}
