import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CalendarCreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date | null;
}

export const CalendarCreateEventModal = React.memo(function CalendarCreateEventModal({
  isOpen,
  onClose,
  initialDate,
}: CalendarCreateEventModalProps) {
  const [eventType, setEventType] = useState<'task' | 'meeting'>('task');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Reset/Initialize form when modal opens
  useEffect(() => {
    if (isOpen && initialDate) {
      setEventType('task');
      setTitle('');
      // set times based on initialDate
      const defaultStart = new Date(initialDate);
      if (defaultStart.getHours() === 0) defaultStart.setHours(9, 0, 0, 0);
      const defaultEnd = new Date(defaultStart);
      defaultEnd.setHours(defaultStart.getHours() + 1);

      setStartTime(format(defaultStart, 'HH:mm'));
      setEndTime(format(defaultEnd, 'HH:mm'));
    }
  }, [isOpen, initialDate]);

  const handleSave = () => {
    // In a real app, you would submit the event to an API here
    // alert(`Created ${eventType}: ${title} from ${startTime} to ${endTime}`);
    onClose();
  };

  if (!initialDate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo sự kiện mới</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-4 mb-2">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                eventType === 'task' 
                ? 'bg-primary/10 text-primary ring-2 ring-primary/30' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setEventType('task')}
            >
              Công việc
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                eventType === 'meeting' 
                ? 'bg-primary/10 text-primary ring-2 ring-primary/30' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
              onClick={() => setEventType('meeting')}
            >
              Lịch hẹn / Cuộc họp
            </button>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Ngày</Label>
            <div className="col-span-3 text-sm font-medium text-foreground">
              {format(initialDate, "EEEE, dd 'tháng' MM 'năm' yyyy", { locale: viLocale })}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Tiêu đề
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={eventType === 'task' ? "Nhập tên công việc..." : "Nhập tên cuộc họp..."}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Từ giờ</Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Đến giờ</Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSave} disabled={!title.trim()}>Lưu lại</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
