import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CalendarEventModalProps {
  selectedDayEvents: { day: Date, events: any[] } | null;
  onClose: () => void;
}

export const CalendarEventModal = React.memo(function CalendarEventModal({
  selectedDayEvents,
  onClose
}: CalendarEventModalProps) {
  return (
    <Dialog open={!!selectedDayEvents} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-5 h-5 text-indigo-500" />
            Sự kiện ngày {selectedDayEvents?.day && format(selectedDayEvents.day, "dd/MM/yyyy")}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 mt-4">
          {selectedDayEvents?.events.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Không có sự kiện nào.</p>
          ) : (
            selectedDayEvents?.events.map((evt) => (
              <div 
                key={evt.id} 
                className={`p-3 rounded-lg border ${evt.colorClass} flex flex-col gap-1.5`}
              >
                <div className="flex items-start gap-2">
                  {evt.type === 'meeting' ? <Video className="w-4 h-4 shrink-0 mt-0.5" /> : 
                  evt.isCompleted ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <Clock className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span className="font-semibold text-sm leading-tight">{evt.title}</span>
                </div>
                <span className="text-xs opacity-80 ml-6">
                  {evt.type === 'meeting' ? 'Lịch họp' : (evt.isCompleted ? 'Hoàn thành' : 'Đang xử lý / Trễ hạn')}
                </span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
