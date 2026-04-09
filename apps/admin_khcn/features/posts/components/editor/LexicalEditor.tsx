"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
// Import tất cả Plugins từ 1 nơi
import { ToolbarPlugin } from "./plugins/ToolbarPlugin";
import { ImagePlugin } from "./plugins/ImagePlugin";

// Import Config
import { initialConfig } from "./editorConfig";
import { TableContextMenuPlugin } from "./plugins/TableContextMenuPlugin";
import { TableResizerPlugin } from "./plugins/TableResizerPlugin";
import { MediaContextMenuPlugin } from "./plugins/MediaContextMenuPlugin";
import { ImageResizerPlugin } from "./plugins/ImageResizerPlugin";
import PasteLogPlugin from "./plugins/PasteLogPlugin";

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function LexicalEditor({ value, onChange, placeholder = "Nhập nội dung...", minHeight = "500px" }: LexicalEditorProps) {
  // Cấu hình khởi tạo với giá trị ban đầu nếu có
  const config = {
    ...initialConfig,
    editorState: value ? value : undefined,
  };

  return (
    <LexicalComposer initialConfig={config}>
      <div className="border rounded-xl shadow-sm bg-background flex flex-col focus-within:ring-2 focus-within:ring-primary/20">

        {/* THANH CÔNG CỤ BÂY GIỜ LÀ MỘT PLUGIN */}
        <ToolbarPlugin />

        <div className="relative flex-1 overflow-x-auto max-w-full" style={{ minHeight }}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="p-5 outline-none min-h-full prose max-w-none" style={{ minHeight }} />}
            placeholder={<div className="absolute top-5 left-5 text-muted-foreground">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary as any}
          />
          <TableContextMenuPlugin />
          <TableResizerPlugin />
          {/* CÁC PLUGINS KHÔNG CÓ GIAO DIỆN CHẠY NGẦM BÊN DƯỚI */}
          <HistoryPlugin />
          <MediaContextMenuPlugin />
          <ListPlugin />
          <LinkPlugin />
          <TablePlugin hasCellMerge={true} hasCellBackgroundColor={false} />
          <ImageResizerPlugin />
          <ImagePlugin />
          <PasteLogPlugin />
          {/* <MarkdownShortcutPlugin transformers={CUSTOM_TRANSFORMERS} /> */}

          <OnChangePlugin
            onChange={(editorState) => {
              onChange(JSON.stringify(editorState.toJSON()));
            }}
          />
        </div>
      </div>
    </LexicalComposer>
  );
}
