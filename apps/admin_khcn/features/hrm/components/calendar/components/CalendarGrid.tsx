import React, { useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isToday,
  addDays,
  startOfDay,
  differenceInDays
} from "date-fns";
import { CheckCircle2, Clock, Video } from 'lucide-react';
import { Text } from '@/components/ui/typography';

interface CalendarGridProps {
  currentDate: Date;
  filteredEvents: any[];
  isLoading: boolean;
  onSelectDayEvents: (data: { day: Date, events: any[] }) => void;
}

const WEEK_DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export const CalendarGrid = React.memo(function CalendarGrid({
  currentDate,
  filteredEvents,
  isLoading,
  onSelectDayEvents
}: CalendarGridProps) {

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
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

          days.push(
            <div 
              key={cloneDay.toString()} 
              className={`flex flex-col p-2 border-r border-b border-slate-200 dark:border-slate-800 transition-colors
                ${!isSameMonth(cloneDay, monthStart) ? "bg-slate-50/50 dark:bg-slate-900/20" : "bg-white dark:bg-slate-900"}
                ${isToday(cloneDay) && isSameMonth(cloneDay, monthStart) ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""}
              `}
            >
              {isSameMonth(cloneDay, monthStart) && (
                <div className="flex items-center justify-between shrink-0 z-10 relative">
                  <Text as="span" variant="small" weight="medium" className={`w-7 h-7 flex items-center justify-center rounded-full ${isToday(cloneDay) ? "bg-indigo-600 text-white" : "text-slate-700 dark:text-slate-300"} `}>
                    {formattedDate}
                  </Text>
                  {dayEvents.length > 0 && (
                    <button 
                      onClick={() => onSelectDayEvents({ day: cloneDay, events: dayEvents })}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Xem chi tiết ({dayEvents.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          );
      }

      const maxTrackIndex = Math.max(0, tracks.length);
      const ROW_HEIGHT = 26; 
      const TOP_PADDING = 36; 

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
                          onClick={() => onSelectDayEvents({ day: evt.startDate, events: [evt] })}
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
  }, [currentDate, filteredEvents, isLoading, onSelectDayEvents, endDate, monthStart, startDate]);

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-slate-900">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0">
        {WEEK_DAYS.map((wd) => (
          <Text as="div" variant="small" weight="semibold" key={wd} className="py-3 text-center text-slate-600 dark:text-slate-300 uppercase tracking-wider border-r border-slate-200 dark:border-slate-800 last:border-0">
            {wd}
          </Text>
        ))}
      </div>
      
      <div className="flex flex-col flex-1 min-h-0 relative">
        {isLoading ? (
          // Skeleton Loading state
          <div className="absolute inset-0 grid grid-rows-5 opacity-50 pointer-events-none animate-pulse">
            {[...Array(5)].map((_, rIdx) => (
              <div key={rIdx} className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                {[...Array(7)].map((_, cIdx) => (
                  <div key={cIdx} className="border-r border-slate-200 dark:border-slate-800 p-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 mb-2"></div>
                    {/* Random skeleton lines */}
                    {Math.random() > 0.5 && <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full mb-1"></div>}
                    {Math.random() > 0.7 && <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>}
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
