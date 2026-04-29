"use client";

import { ReactNode, memo } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
}

const PageHeader = ({
  title,
  description,
  icon: Icon,
  iconClassName = "text-blue-600 bg-blue-500/10",
  actions
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
          {Icon && (
            <div className={`p-2.5 rounded-2xl shadow-sm ${iconClassName}`}>
              <Icon className="h-8 w-8" />
            </div>
          )}
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground font-medium pl-14">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default memo(PageHeader);
