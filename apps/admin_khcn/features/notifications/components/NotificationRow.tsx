import { Bell, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type NotificationItem } from "../api";

export function NotificationRow({
  item,
  onMarkRead,
  onClick,
}: {
  item: NotificationItem;
  onMarkRead: (id: string) => void;
  onClick: (item: NotificationItem) => void;
}) {
  const resolveHref = (item: NotificationItem) => {
    const { module, type, id, link } = item.metadata || {};
    if (module === 'hrm' && type === 'work-plans/tasks' && id) {
      return `/services/hrm/work-plans/tasks?taskId=${id}`;
    }
    if (module && type && id) return `/services/${module}/${type}/${id}`;
    if (link) return link;
    return "#";
  };
  const href = resolveHref(item);

  const content = (
    <div
      className={`
        group relative flex gap-3 px-3 sm:px-4 py-3 border-b border-border/40 last:border-0 cursor-pointer
        transition-colors hover:bg-muted/50
        ${item.read ? "bg-transparent opacity-80" : "bg-primary/[0.04] dark:bg-primary/10"}
      `}
    >
      <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${item.read ? 'bg-muted/50 border-border text-muted-foreground' : 'bg-primary/10 border-primary/20 text-primary'}`}>
        {item.type === 'SYSTEM' ? <FileText className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      </div>
      <div className="flex flex-1 flex-col gap-1 pr-6">
        <p className={`text-[14px] leading-snug ${item.read ? 'font-normal text-muted-foreground' : 'font-semibold text-foreground'}`}>
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {item.body}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground/70">
          <Calendar className="h-3 w-3" />
          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi }) : ""}
        </div>
      </div>
      {!item.read && (
        <div className="absolute right-3 sm:right-4 top-4 flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-primary group-hover:hidden shadow-sm" />
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden group-hover:flex shrink-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkRead(item.id);
            }}
            title="Đánh dấu đã đọc"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );

  if (href === "#") {
    return <div onClick={() => onClick(item)}>{content}</div>;
  }

  return (
    <Link href={href} prefetch={true} onClick={() => onClick(item)} className="block">
      {content}
    </Link>
  );
}
