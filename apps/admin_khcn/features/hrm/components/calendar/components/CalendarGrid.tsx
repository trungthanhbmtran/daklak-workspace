import React, { useMemo } from 'react';
import { 
  format, 
  startOfMonth, endOfMonth, 
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  startOfWeek, endOfWeek, 
  isSameMonth, 
  isToday,
  addDays,
  startOfDay,
  differenceInDays
} from "date-fns";
import { CheckCircle2, Clock, Video } from 'lucide-react';
import { Text } from '@/components/ui/typography';
import { isHoliday } from '@/lib/holidays';

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

          days.push(
            <div 
              key={cloneDay.toString()} 
              className={`flex flex-col p-2 border-r border-b border-border transition-colors cursor-pointer hover:bg-muted/50
                ${!isCurrentView ? "bg-muted/30" : 
                  holiday ? "bg-rose-50/50 dark:bg-rose-900/10" : "bg-background"}
                ${isToday(cloneDay) && isCurrentView ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""}
              `}
              onClick={() => onDateClick && onDateClick(cloneDay)}
            >
              {isCurrentView && (
                <div className="flex flex-col z-10 relative h-full">
                  <div className="flex items-center justify-between shrink-0">
                    <Text as="span" variant="small" weight="medium" className={`w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(cloneDay) ? "bg-primary text-primary-foreground" : 
                      holiday ? "text-rose-600 dark:text-rose-400 font-bold" :
                      "text-foreground"} `}>
                      {formattedDate}
                    </Text>
                    {dayEvents.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onSelectDayEvents({ day: cloneDay, events: dayEvents }); }}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        Xem ({dayEvents.length})
                      </button>
                    )}
                  </div>
                  {holiday && (
                    <div className="text-[10px] text-rose-500/80 font-medium truncate mt-1 pointer-events-none" title={holiday.name}>
                      {holiday.name}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
      }

      const maxTrackIndex = Math.max(0, tracks.length);
      const ROW_HEIGHT = 26; 
      const TOP_PADDING = 48; // increased to accommodate holiday names

      computedRows.push(
        <div 
          className="relative grid grid-cols-7 flex-1 border-b-0 border-r-0" 
          key={weekStartDay.toString()}
          style={{ minHeight: Math.max(100, maxTrackIndex * ROW_HEIGHT + TOP_PADDING + 10) + 'px' }}
        >
          {days}
          <div className="absolute inset-0 pointer-events-none" style={{ paddingTop: TOP_PADDING }}>
              <div className="relative w-full h-full">
                  {positionedEvents.map(evt => (
                      <div 
                          key={evt.id}
                          className={`absolute ${evt.colorClass} border rounded px-1.5 py-0.5 text-xs truncate pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 shadow-sm`}
                          style={{
                              left: `calc(${(evt.colStart * 100) / 7}% + 4px)`,
                              width: `calc(${(evt.span * 100) / 7}% - 8px)`,
                              top: `${evt.trackIndex * ROW_HEIGHT}px`,
                              height: '22px'
                          }}
                          title={evt.title}
                          onClick={(e) => { e.stopPropagation(); onSelectDayEvents({ day: evt.startDate, events: [evt] }); }}
                      >
                          {evt.type === 'meeting' ? <Video className="w-3 h-3 shrink-0" /> : 
                          evt.isCompleted ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <Clock className="w-3 h-3 shrink-0" />}
                          <Text as="span" weight="medium" className="truncate">{evt.title}</Text>
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
    <div className="flex flex-col w-full h-full bg-background">
      <div className="grid grid-cols-7 border-b border-border bg-muted/50 shrink-0">
        {WEEK_DAYS.map((wd) => (
          <Text as="div" variant="small" weight="semibold" key={wd} className="py-3 text-center text-muted-foreground uppercase tracking-wider border-r border-border last:border-0">
            {wd}
          </Text>
        ))}
      </div>
      
      <div className="flex flex-col flex-1 min-h-0 relative">
        {isLoading ? (
          // Skeleton Loading state
          <div className="absolute inset-0 grid grid-rows-5 opacity-50 pointer-events-none animate-pulse">
            {[...Array(5)].map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-7 border-b border-border">
                {[...Array(7)].map((_, cIdx) => (
                  <div key={cIdx} className="border-r border-border p-2">
                    <div className="w-6 h-6 rounded-full bg-muted mb-2"></div>
                    {/* Random skeleton lines */}
                    {Math.random() > 0.5 && <div className="h-4 bg-muted rounded w-full mb-1"></div>}
                    {Math.random() > 0.7 && <div className="h-4 bg-muted rounded w-2/3"></div>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : rows}
      </div>
    </div>
  );
});
