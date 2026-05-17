import React from "react";
import { Row } from "../core/types";
import { cn } from "@/lib/utils";

interface SectionRendererProps {
  row: Row;
  children: React.ReactNode;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ row, children }) => {
  const settings = row.settings || {};

  // Formulate custom styles based on settings
  const customStyles: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || "transparent",
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    paddingTop: settings.paddingTop ? `${settings.paddingTop}px` : undefined,
    paddingBottom: settings.paddingBottom ? `${settings.paddingBottom}px` : undefined,
    borderColor: settings.borderColor || undefined,
  };

  // Determine grid alignment
  const containerClasses = cn(
    "w-full transition-all duration-300 relative border-slate-100/50 dark:border-slate-800/40",
    settings.fullWidth ? "max-w-none" : "max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8",
    settings.borderRadius || "rounded-3xl",
    settings.borderWidth || "border-0",
    settings.textColor || "text-slate-700 dark:text-slate-300"
  );

  return (
    <section 
      style={customStyles} 
      className={containerClasses}
    >
      <div 
        className={cn(
          "grid grid-cols-1 lg:grid-cols-12",
          settings.gap || "gap-6"
        )}
      >
        {children}
      </div>
    </section>
  );
};

export default SectionRenderer;
