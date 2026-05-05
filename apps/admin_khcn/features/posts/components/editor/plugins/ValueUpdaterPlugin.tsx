"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { $getRoot, $getSelection, LexicalEditor } from "lexical";

interface ValueUpdaterPluginProps {
  value: string;
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

    // Kiểm tra xem value mới có thực sự khác với nội dung hiện tại trong editor không
    const currentEditorState = JSON.stringify(editor.getEditorState().toJSON());
    if (value === currentEditorState) {
      return;
    }

    // Cập nhật nội dung editor từ value mới
    editor.update(() => {
      try {
        const initialState = editor.parseEditorState(value);
        editor.setEditorState(initialState);
      } catch (e) {
        console.error("[ValueUpdaterPlugin] Failed to parse value:", e);
      }
    });
  }, [editor, value]);

  return null;
}
