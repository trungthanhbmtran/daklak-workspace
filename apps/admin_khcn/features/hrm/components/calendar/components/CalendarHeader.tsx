import React from 'react';
import { format, getWeekOfMonth, getQuarter } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export type CalendarViewMode = "day" | "week" | "month" | "quarter" | "year";

interface CalendarHeaderProps {
  currentDate: Date;
  isLoading: boolean;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  onGoToToday: () => void;
  onOpenAiModal?: () => void;
}

export const CalendarHeader = React.memo(function CalendarHeader({
  currentDate,
  isLoading,
  viewMode,
  setViewMode,
  onPrevDate,
  onNextDate,
  onGoToToday,
  onOpenAiModal,
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
        <div className="inline-flex items-center bg-muted/50 rounded-lg p-1 border border-border/50 shadow-inner">
          {[
            { id: 'day', label: 'Ngày' },
            { id: 'week', label: 'Tuần' },
            { id: 'month', label: 'Tháng' },
            { id: 'quarter', label: 'Quý' },
            { id: 'year', label: 'Năm' },
          ].map((mode) => (
            <Button
              key={mode.id}
              variant="ghost"
              onClick={() => setViewMode(mode.id as CalendarViewMode)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all h-8 ${viewMode === mode.id
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
            >
              {mode.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onOpenAiModal && (
            <Button 
              onClick={onOpenAiModal} 
              className="mr-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-md border-0 transition-all hover:scale-105 active:scale-95 px-3 py-1.5 h-8 font-medium rounded-md"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              AI Trợ lý
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onGoToToday} className="mr-1 h-8 rounded-md px-3 font-medium">
            Hôm nay
          </Button>
          <Button variant="ghost" size="icon" onClick={onPrevDate} className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onNextDate} className="w-8 h-8 rounded-full bg-muted/50 hover:bg-muted"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </CardHeader>
  );
});
