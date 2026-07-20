import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl" | "max-w-6xl" | "max-w-7xl" | "max-w-full";
  contentClassName?: string;
  bodyClassName?: string;
  fullHeight?: boolean; // Cho phép force modal giãn toàn bộ chiều cao (100dvh hoặc ~95vh)
}

export function ResponsiveModal({
  open,
  onOpenChange,
  title,
  description,
  icon,
  children,
  footer,
  maxWidth = "max-w-4xl",
  contentClassName,
  bodyClassName,
  fullHeight = false,
}: ResponsiveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-full h-[100dvh] sm:h-auto rounded-none sm:rounded-3xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl",
          maxWidth,
          fullHeight && "sm:h-[95dvh]",
          contentClassName
        )}
      >
        <div className={cn(
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col w-full h-full",
          fullHeight ? "max-h-[100dvh] sm:max-h-[95dvh]" : "max-h-[100dvh] sm:max-h-[90vh]"
        )}>
          <DialogHeader className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className={cn("p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col", bodyClassName)}>
            {children}
          </div>

          {footer && (
            <DialogFooter className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-950">
              {footer}
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
