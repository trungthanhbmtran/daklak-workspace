import React, { useMemo } from 'react';
import { 
  format, startOfWeek, addDays, 
  startOfDay, differenceInMinutes, isSameDay
} from "date-fns";
import { vi as viLocale } from 'date-fns/locale';
import { Text } from '@/components/ui/typography';

interface CalendarTimeGridProps {
  currentDate: Date;
  filteredEvents: any[];
  isLoading: boolean;
  viewMode: 'day' | 'week' | 'month' | 'quarter' | 'year';
  onSelectDayEvents?: (data: { day: Date, events: any[] }) => void;
  onTimeSlotClick?: (date: Date) => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 to 22:00
const HOUR_HEIGHT = 60; // px per hour

export const CalendarTimeGrid = React.memo(function CalendarTimeGrid({
  currentDate,
  filteredEvents,
  isLoading,
  viewMode,
  onSelectDayEvents,
  onTimeSlotClick
}: CalendarTimeGridProps) {
  
  const days = useMemo(() => {
    if (viewMode === 'day') {
      return [startOfDay(currentDate)];
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate, viewMode]);

  // Position events
  const positionedEvents = useMemo(() => {
    return filteredEvents.map(evt => {
      const segments: any[] = [];
      days.forEach((day, colIndex) => {
        const dayStart = new Date(day);
        dayStart.setHours(7, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(22, 59, 59, 999);
        
        const evtStart = new Date(evt.startDate);
        const evtEnd = new Date(evt.endDate);
        
        if (evtStart <= dayEnd && evtEnd >= dayStart) {
           const actualStart = evtStart > dayStart ? evtStart : dayStart;
           const actualEnd = evtEnd < dayEnd ? evtEnd : dayEnd;
           
           const startMinutes = differenceInMinutes(actualStart, dayStart);
           const durationMinutes = Math.max(differenceInMinutes(actualEnd, actualStart), 30); // min 30 min height
           
           const top = (startMinutes / 60) * HOUR_HEIGHT;
           const height = (durationMinutes / 60) * HOUR_HEIGHT;
           
           segments.push({
             ...evt,
             colIndex,
             top,
             height,
             actualStart,
             actualEnd
           });
        }
      });
      return segments;
    }).flat();
  }, [filteredEvents, days]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header (Days) */}
      <div className="flex border-b border-border">
        <div className="w-16 shrink-0 border-r border-border bg-muted/50"></div>
        <div className="flex flex-1">
          {days.map((day, i) => (
            <div key={i} className="flex-1 text-center py-2 border-r border-border last:border-r-0">
              <Text variant="small" className="capitalize text-muted-foreground">{format(day, 'EEEE', { locale: viLocale })}</Text>
              <div className={`text-xl font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-primary' : 'text-foreground'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-y-auto relative">
        <div className="w-16 shrink-0 border-r border-border bg-muted/30 flex flex-col pt-3">
          {HOURS.map(hour => (
            <div key={hour} className="text-xs text-right pr-2 text-muted-foreground relative -top-2" style={{ height: HOUR_HEIGHT }}>
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        
        <div className="flex flex-1 relative pt-3"> 
          {/* Background Grid Lines */}
          <div className="absolute inset-0 pointer-events-none flex flex-col pt-3">
            {HOURS.map(hour => (
              <div key={hour} className="border-b border-border/50 w-full" style={{ height: HOUR_HEIGHT }}></div>
            ))}
          </div>

          {/* Columns */}
          <div className="flex flex-1 relative z-10">
            {days.map((day, colIndex) => (
              <div key={colIndex} className="flex-1 border-r border-border/50 last:border-r-0 relative">
                {/* Clickable slots */}
                {HOURS.map(hour => (
                  <div 
                    key={hour} 
                    className="w-full hover:bg-muted/50 cursor-pointer transition-colors" 
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => {
                      if (onTimeSlotClick) {
                        const clickedTime = new Date(day);
                        clickedTime.setHours(hour, 0, 0, 0);
                        onTimeSlotClick(clickedTime);
                      }
                    }}
                  ></div>
                ))}
                
                {/* Events for this day */}
                {positionedEvents.filter(e => e.colIndex === colIndex).map((evt, i) => (
                  <div
                    key={`${evt.id}-${i}`}
                    className={`absolute left-1 right-1 rounded-md px-2 py-1.5 overflow-hidden shadow-sm text-xs border cursor-pointer hover:brightness-95 transition-all flex flex-col gap-0.5 ${evt.colorClass}`}
                    style={{
                      top: evt.top,
                      height: evt.height,
                      zIndex: 20
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectDayEvents) {
                        onSelectDayEvents({ day, events: [evt] });
                      }
                    }}
                  >
                    <Text variant="small" weight="semibold" className="truncate text-inherit">{evt.title}</Text>
                    <div className="opacity-80 truncate text-[10px] text-inherit font-medium">{format(evt.actualStart, 'HH:mm')} - {format(evt.actualEnd, 'HH:mm')}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
