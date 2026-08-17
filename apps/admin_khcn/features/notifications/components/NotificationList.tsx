import { NotificationRow } from "./NotificationRow";
import { type NotificationItem } from "../api";
import { Bell } from "lucide-react";

export function NotificationList({
  list,
  filter,
  onMarkRead,
  onClick,
}: {
  list: NotificationItem[];
  filter: 'ALL' | 'UNREAD';
  onMarkRead: (id: string) => void;
  onClick: (item: NotificationItem) => void;
}) {
  const filteredList = list.filter((item) => filter === "ALL" || !item.read);

  if (filteredList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
          <Bell className="h-5 w-5 opacity-50" />
        </div>
        <p className="text-sm">
          Bạn chưa có thông báo nào {filter === "UNREAD" ? "chưa đọc" : ""}
        </p>
      </div>
    );
  }

  const reminders = filteredList.filter((item) => item.category === "REMINDER");
  const today = filteredList.filter((item) => item.category === "TODAY");
  const earlier = filteredList.filter((item) => item.category === "EARLIER");

  return (
    <div className="flex flex-col pb-2">
      {reminders.length > 0 && (
        <div className="mt-1">
          <h5 className="px-3 sm:px-4 py-1.5 text-[15px] font-bold text-foreground">
            Nhắc việc
          </h5>
          {reminders.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={onMarkRead}
              onClick={onClick}
            />
          ))}
        </div>
      )}
      {today.length > 0 && (
        <div className="mt-1">
          <h5 className="px-3 sm:px-4 py-1.5 text-[15px] font-bold text-foreground">
            Hôm nay
          </h5>
          {today.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={onMarkRead}
              onClick={onClick}
            />
          ))}
        </div>
      )}
      {earlier.length > 0 && (
        <div className="mt-1">
          <h5 className="px-3 sm:px-4 py-1.5 text-[15px] font-bold text-foreground">
            Trước đó
          </h5>
          {earlier.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onMarkRead={onMarkRead}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
