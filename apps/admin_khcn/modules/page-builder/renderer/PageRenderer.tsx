import React from "react";
import { Row } from "../core/types";
import { SectionRenderer } from "./SectionRenderer";
import { BlockRenderer } from "./BlockRenderer";
import { cn } from "@/lib/utils";

interface PageRendererProps {
  layout: Row[];
  activeLang?: string;
  className?: string;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  layout = [],
  activeLang = "vi",
  className
}) => {
  if (!Array.isArray(layout) || layout.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
        <span className="text-xs font-black uppercase text-slate-350 dark:text-slate-600 tracking-widest">
          Không tìm thấy cấu trúc Layout
        </span>
        <p className="text-[10px] text-slate-400 font-bold max-w-xs">
          Vui lòng thiết lập cấu trúc trang trong bảng quản lý giao diện để hiển thị nội dung.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-8 py-6 transition-all duration-300", className)}>
      {layout.map((row) => (
        <SectionRenderer key={row.rowId} row={row}>
          {row.columns.map((col) => (
            <div
              key={col.id}
              className={cn(
                "col-span-12 flex flex-col gap-6",
                col.colSpan || "lg:col-span-12"
              )}
            >
              {col.widgets.map((widget) => (
                <BlockRenderer
                  key={widget.id}
                  widget={widget}
                  activeLang={activeLang}
                />
              ))}
            </div>
          ))}
        </SectionRenderer>
      ))}
    </div>
  );
};

export default PageRenderer;
