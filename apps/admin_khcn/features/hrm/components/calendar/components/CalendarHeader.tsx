import React from 'react';
import { format, getWeekOfMonth, getQuarter } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export type CalendarViewMode = "day" | "week" | "month" | "quarter" | "year";

interface CalendarHeaderProps {
  currentDate: Date;
  isLoading: boolean;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onGoToToday: () => void;
}

export const CalendarHeader = React.memo(function CalendarHeader({
  currentDate,
  isLoading,
  viewMode,
  setViewMode,
  onPrevDate,
  onNextDate,
  onGoToToday,
}: CalendarHeaderProps) {

  const getTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, dd 'tháng' MM 'năm' yyyy", { locale: viLocale });
      case 'week':
        return `Tuần ${getWeekOfMonth(currentDate, { weekStartsOn: 1 })}, tháng ${format(currentDate, "MM 'năm' yyyy")}`;
      case 'month':
        return format(currentDate, "MMMM 'năm' yyyy", { locale: viLocale });
      case 'quarter':
        return `Quý ${getQuarter(currentDate)} năm ${format(currentDate, "yyyy")}`;
      case 'year':
        return `Năm ${format(currentDate, "yyyy")}`;
      default:
        return format(currentDate, "MMMM 'năm' yyyy", { locale: viLocale });
    }
  };

  return (
    <CardHeader className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-5 bg-card border-b border-border z-20 shadow-sm relative">
      <div className="flex items-center gap-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground capitalize">
          {getTitle()}
        </CardTitle>
        {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex items-center bg-muted rounded-lg p-1">
          {[
            { id: 'day', label: 'Ngày' },
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'quarter', label: 'Quý' },
            { id: 'year', label: 'Năm' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as CalendarViewMode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                viewMode === mode.id
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onGoToToday} className="mr-1">
            Hôm nay
          </Button>
          <Button variant="outline" size="icon" onClick={onPrevDate} className="w-8 h-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNextDate} className="w-8 h-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardHeader>
  );
});
