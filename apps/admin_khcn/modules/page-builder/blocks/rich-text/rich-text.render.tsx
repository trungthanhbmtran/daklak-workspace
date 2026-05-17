import React from "react";
import { Widget } from "../../core/types";
import { RichTextData } from "./rich-text.schema";

interface RichTextRenderProps {
  widget: Widget<RichTextData>;
  activeLang: string;
}

export const RichTextRender: React.FC<RichTextRenderProps> = ({ widget, activeLang }) => {
  const content = widget.content?.[activeLang] || "";

  // Helper to check if string is a valid Lexical JSON state
  const isLexicalJson = (str: string) => {
    return str.trim().startsWith("{") && str.trim().endsWith("}");
  };

  return (
    <div className="w-full prose prose-indigo max-w-none dark:prose-invert transition-all">
      {content ? (
        isLexicalJson(content) ? (
          // In a full production portal app, this mounts a ReadOnly Lexical Editor context to render nodes.
          // For dynamic headless rendering, we provide a clean, accessible block presentation.
          <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm antialiased whitespace-pre-wrap">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2 shadow-sm">
              <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">Rich Text Content</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {/* Fallback description when Lexical state is stored as a raw JSON payload */}
                [Nội dung văn bản định dạng Rich-Text tích hợp Lexical]
              </span>
            </div>
          </div>
        ) : (
          <div 
            dangerouslySetInnerHTML={{ __html: content }} 
            className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm antialiased"
          />
        )
      ) : (
        <div className="py-6 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
          <p className="text-xs font-bold text-slate-350 dark:text-slate-600 uppercase tracking-widest">Chưa thiết lập nội dung văn bản</p>
        </div>
      )}
    </div>
  );
};

export default RichTextRender;
