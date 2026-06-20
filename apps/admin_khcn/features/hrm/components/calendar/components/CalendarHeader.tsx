import React from 'react';
import { format } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  isLoading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
}

export const CalendarHeader = React.memo(function CalendarHeader({
  currentDate,
  isLoading,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}: CalendarHeaderProps) {
  return (
    <CardHeader className="shrink-0 flex flex-col md:flex-row items-center justify-between py-3 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-4">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
          {format(currentDate, "MMMM 'năm' yyyy", { locale: viLocale })}
        </CardTitle>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-0">
        <Button variant="outline" size="sm" onClick={onGoToToday} className="mr-2">
          Hôm nay
        </Button>
        <Button variant="outline" size="icon" onClick={onPrevMonth} className="w-8 h-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth} className="w-8 h-8">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
  );
});
