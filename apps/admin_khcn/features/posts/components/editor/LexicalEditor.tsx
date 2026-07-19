/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
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
import ValueUpdaterPlugin from "./plugins/ValueUpdaterPlugin";

interface LexicalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

function isLexicalJson(str: string): boolean {
  if (!str) return false;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object" && "root" in parsed;
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (e) {
    return false;
  }
}

function convertPlainTextToLexicalJson(text: string): string {
  return JSON.stringify({
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
              text: text || "",
              type: "text",
              version: 1
            }
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1
        }
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1
    }
  });
}

export function LexicalEditor({ value, onChange, placeholder = "Nhập nội dung...", minHeight = "500px" }: LexicalEditorProps) {
  // Đảm bảo value luôn là chuỗi Lexical JSON hợp lệ
  const safeValue = isLexicalJson(value) ? value : convertPlainTextToLexicalJson(value);

  // Cấu hình khởi tạo với giá trị ban đầu nếu có
  const config = {
    ...initialConfig,
    editorState: safeValue ? safeValue : undefined,
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
          <ValueUpdaterPlugin value={value} />
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
