"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";

interface ValueUpdaterPluginProps {
  value: string;
}

function isLexicalJson(str: string): boolean {
  if (!str) return false;
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === "object" && "root" in parsed;
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

export default function ValueUpdaterPlugin({ value }: ValueUpdaterPluginProps): null {
  const [editor] = useLexicalComposerContext();
  const lastValueRef = useRef(value);

  useEffect(() => {
    // Nếu value truyền vào giống với lần cập nhật trước đó, bỏ qua để tránh loop
    if (value === lastValueRef.current) {
      return;
    }

    lastValueRef.current = value;

    // Đảm bảo value luôn là chuỗi Lexical JSON hợp lệ
    const safeValue = isLexicalJson(value) ? value : convertPlainTextToLexicalJson(value);

    // Kiểm tra xem editor có đang được focus (người dùng đang gõ phím trực tiếp) không
    const rootElement = editor.getRootElement();
    if (rootElement && (rootElement === document.activeElement || rootElement.contains(document.activeElement))) {
      return;
    }

    const currentEditorState = JSON.stringify(editor.getEditorState().toJSON());
    if (safeValue === currentEditorState) {
      return;
    }

    // Cập nhật nội dung editor từ value mới (không dùng editor.update vì setEditorState là đồng bộ độc lập)
    try {
      const initialState = editor.parseEditorState(safeValue);
      editor.setEditorState(initialState);
    } catch (e) {
      console.error("[ValueUpdaterPlugin] Failed to parse value:", e);
    }
  }, [editor, value]);

  return null;
}
