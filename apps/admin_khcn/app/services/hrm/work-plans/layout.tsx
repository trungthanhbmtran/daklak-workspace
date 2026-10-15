import React from "react";

export default function WorkPlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 flex flex-col min-w-0">
      {children}
    </div>
  );
}
