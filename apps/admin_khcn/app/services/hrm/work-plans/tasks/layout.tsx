import React from "react";

export default function TasksLayout({
  children,
  sheet,
}: {
  children: React.ReactNode;
  sheet: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      {children}
      {sheet}
    </div>
  );
}
