import React from "react";
import { Widget } from "../../core/types";
import { RichTextData } from "./rich-text.schema";
import { LexicalEditor } from "@/features/posts/components/editor/LexicalEditor";
import { Label } from "@/components/ui/label";
import { useEditorStore } from "../../store/editorStore";

interface RichTextEditorProps {
  widget: Widget<RichTextData>;
  onChangeData: (data: RichTextData) => void;
  activeLang: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ widget, activeLang }) => {
  const updateWidgetContent = useEditorStore((state) => state.updateWidgetContent);
  const content = widget.content?.[activeLang] || "";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
          Nội dung văn bản chi tiết
        </Label>
        <div className="p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden min-h-[420px]">
          <LexicalEditor
            key={`${widget.id}-${activeLang}`}
            value={content}
            onChange={(val) => updateWidgetContent(widget.id, val)}
            placeholder="Bắt đầu nhập hoặc chèn liên kết, hình ảnh tại đây..."
          />
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
