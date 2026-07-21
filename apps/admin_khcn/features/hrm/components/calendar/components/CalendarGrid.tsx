import React, { useMemo } from 'react';
import { 
  format, 
  startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  startOfWeek, endOfWeek, 
  isToday,
  addDays,
  startOfDay,
  differenceInDays
} from "date-fns";
import { CheckCircle2, Clock, Video } from 'lucide-react';
import { Text } from '@/components/ui/typography';
import { isHoliday } from '@/lib/holidays';
import { Button } from "@/components/ui/button";

interface CalendarGridProps {
  currentDate: Date;
  filteredEvents: any[];
  isLoading: boolean;
  viewMode?: 'month' | 'quarter' | 'year' | 'week' | 'day';
  onSelectDayEvents: (data: { day: Date, events: any[] }) => void;
  onDateClick?: (date: Date) => void;
}

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const CalendarGrid = React.memo(function CalendarGrid({
  currentDate,
  filteredEvents,
  isLoading,
  viewMode = 'month',
  onSelectDayEvents,
  onDateClick
}: CalendarGridProps) {

  let viewStart: Date, viewEnd: Date;
  if (viewMode === 'quarter') {
    viewStart = startOfQuarter(currentDate);
    viewEnd = endOfQuarter(currentDate);
  } else if (viewMode === 'year') {
    viewStart = startOfYear(currentDate);
    viewEnd = endOfYear(currentDate);
  } else {
    viewStart = startOfMonth(currentDate);
    viewEnd = endOfMonth(currentDate);
  }

  const startDate = startOfWeek(viewStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(viewEnd, { weekStartsOn: 1 });
  const dateFormat = "d";

  const rows = useMemo(() => {
    if (isLoading) return null; // handled below with skeleton

    const computedRows = [];
    let weekStartDay = startDate;

    const MAX_TRACKS = 3;
    const ROW_HEIGHT = 28; 
    const TOP_PADDING = 48; // enough space for day number and holiday

    while (weekStartDay <= endDate) {
      const weekEndDay = endOfWeek(weekStartDay, { weekStartsOn: 1 });
      
      // 1. Get events overlapping with this week
      const weekEvents = filteredEvents.filter(e => {
          const eS = startOfDay(e.startDate);
          const eE = startOfDay(e.endDate);
          const wS = startOfDay(weekStartDay);
          const wE = startOfDay(weekEndDay);
          return eS <= wE && eE >= wS;
      }).sort((a, b) => {
          const startDiff = a.startDate.getTime() - b.startDate.getTime();
          if (startDiff !== 0) return startDiff;
          return b.endDate.getTime() - b.startDate.getTime() - (a.endDate.getTime() - a.startDate.getTime());
      });

      // 2. Compute tracks
      const tracks: any[][] = [];
      const positionedEvents = weekEvents.map(evt => {
          const eS = startOfDay(evt.startDate);
          const eE = startOfDay(evt.endDate);
          const wS = startOfDay(weekStartDay);
          
          const colStart = Math.max(0, differenceInDays(eS, wS));
          const colEnd = Math.min(6, differenceInDays(eE, wS));
          const span = colEnd - colStart + 1;
          
          let trackIndex = 0;
          while (true) {
              if (!tracks[trackIndex]) tracks[trackIndex] = [];
              const overlap = tracks[trackIndex].some(placed => {
                  return !(colEnd < placed.colStart || colStart > placed.colEnd);
              });
              if (!overlap) {
                  tracks[trackIndex].push({ id: evt.id, colStart, colEnd });
                  break;
              }
              trackIndex++;
          }
          
          return { ...evt, colStart, colEnd, span, trackIndex };
      });

      // Calculate hidden events per day column
      const hiddenCounts = new Array(7).fill(0);
      positionedEvents.forEach(evt => {
        if (evt.trackIndex >= MAX_TRACKS) {
          for (let i = evt.colStart; i <= evt.colEnd; i++) {
            hiddenCounts[i]++;
          }
        }
      });
      
      const visibleEvents = positionedEvents.filter(evt => evt.trackIndex < MAX_TRACKS);

      // 3. Render days background
      const days = [];
      for (let i = 0; i < 7; i++) {
          const cloneDay = addDays(weekStartDay, i);
          const formattedDate = format(cloneDay, dateFormat);
          
          const dayEvents = filteredEvents.filter(e => {
               const eS = startOfDay(e.startDate);
               const eE = startOfDay(e.endDate);
               const cur = startOfDay(cloneDay);
               return eS <= cur && cur <= eE;
          });

          const holiday = isHoliday(cloneDay);
          // For quarter and year, we consider the whole view as "current"
          const isCurrentView = cloneDay >= startOfDay(viewStart) && cloneDay <= startOfDay(viewEnd);
          const isTodayFlag = isToday(cloneDay);

          days.push(
            <div 
              key={cloneDay.toString()} 
              className={`relative flex flex-col p-2 border-r border-b border-border transition-colors cursor-pointer group
                ${!isCurrentView ? "bg-muted/30 hover:bg-muted/40" : 
                  holiday ? "bg-rose-50/30 hover:bg-rose-50/60 dark:bg-rose-900/10 dark:hover:bg-rose-900/20" : 
                  "bg-background hover:bg-muted/30"}
                ${isTodayFlag && isCurrentView ? "ring-1 ring-inset ring-primary/40 bg-primary/[0.02]" : ""}
              `}
              onClick={() => onDateClick && onDateClick(cloneDay)}
            >
              {isCurrentView && (
                <div className="flex flex-col z-10 relative h-full">
                  <div className="flex items-center justify-between shrink-0">
                    <Text as="span" variant="small" weight="medium" className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                      isTodayFlag ? "bg-primary text-primary-foreground shadow-sm" : 
                      holiday ? "text-rose-600 dark:text-rose-400 font-bold bg-rose-100/50 dark:bg-rose-900/50" :
                      "text-foreground group-hover:bg-muted"} `}>
                      {formattedDate}
                    </Text>
                  </div>
                  {holiday && (
                    <div className="text-[10px] text-rose-500/90 dark:text-rose-400/90 font-medium truncate mt-1 pointer-events-none" title={holiday.name}>
                      {holiday.name}
                    </div>
                  )}

                  {/* +X more button pinned to bottom */}
                  {hiddenCounts[i] > 0 && (
                     <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1">
                        <Button 
                          onClick={(e) => { e.stopPropagation(); onSelectDayEvents({ day: cloneDay, events: dayEvents }); }}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary font-medium transition-colors cursor-pointer shadow-sm border border-transparent hover:border-primary/20"
                        >
                          +{hiddenCounts[i]} sự kiện
                        </Button>
                     </div>
                  )}
                </div>
              )}
            </div>
          );
      }

      // Height of a row: For month view, flex-1 allows it to grow to fill screen.
      // But we need a minimum height so tracks and +X button fit.
      // TOP_PADDING + (MAX_TRACKS * ROW_HEIGHT) + BOTTOM_PADDING
      // 48 + (3 * 28) + 24 = 156px min height.
      computedRows.push(
        <div 
          className="relative grid grid-cols-7 flex-1 border-b-0 border-r-0 min-h-[140px] lg:min-h-[156px]" 
          key={weekStartDay.toString()}
        >
          {days}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ paddingTop: TOP_PADDING, paddingBottom: 24 }}>
              <div className="relative w-full h-full">
                  {visibleEvents.map(evt => (
                      <div 
                          key={evt.id}
                          className={`absolute ${evt.colorClass} border px-2 py-0.5 text-xs truncate pointer-events-auto cursor-pointer hover:brightness-95 hover:shadow-md transition-all flex items-center gap-1.5 shadow-sm rounded-md`}
                          style={{
                              left: `calc(${(evt.colStart * 100) / 7}% + 6px)`,
                              width: `calc(${(evt.span * 100) / 7}% - 12px)`,
                              top: `${evt.trackIndex * ROW_HEIGHT}px`,
                              height: '24px'
                          }}
                          title={evt.title}
                          onClick={(e) => { e.stopPropagation(); onSelectDayEvents({ day: evt.startDate, events: [evt] }); }}
                      >
                          {evt.type === 'meeting' ? <Video className="w-3.5 h-3.5 shrink-0 opacity-80" /> : 
                          evt.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-80" /> : <Clock className="w-3.5 h-3.5 shrink-0 opacity-80" />}
                          <Text as="span" weight="medium" className="truncate tracking-tight">{evt.title}</Text>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      );
      weekStartDay = addDays(weekStartDay, 7);
    }
    return computedRows;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, filteredEvents, isLoading, onSelectDayEvents, onDateClick, endDate, startDate, viewMode, viewStart, viewEnd]);

  return (
    <div className="flex flex-col w-full h-full bg-card rounded-b-xl border-t-0 border-0">
      <div className="grid grid-cols-7 border-b border-border bg-muted/40 shrink-0 shadow-sm z-10 relative">
        {WEEK_DAYS.map((wd) => (
          <Text as="div" variant="small" weight="bold" key={wd} className="py-3 text-center text-foreground/80 uppercase tracking-wider border-r border-border/50 last:border-0">
            {wd}
          </Text>
        ))}
      </div>
      
      <div className="flex flex-col flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden rounded-b-xl bg-background/50 border-r border-l border-b border-border">
        {isLoading ? (
          // Skeleton Loading state
          <div className="absolute inset-0 grid grid-rows-5 opacity-50 pointer-events-none animate-pulse">
            {[...Array(5)].map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-7 border-b border-border">
                {[...Array(7)].map((_, cIdx) => (
                  <div key={cIdx} className="border-r border-border p-3">
                    <div className="w-7 h-7 rounded-full bg-muted mb-3"></div>
                    <div className="h-4 bg-muted rounded-md w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded-md w-4/5 mb-2"></div>
                    <div className="h-4 bg-muted rounded-md w-2/3"></div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            {rows}
          </div>
        )}
      </div>
    </div>
  );
});
