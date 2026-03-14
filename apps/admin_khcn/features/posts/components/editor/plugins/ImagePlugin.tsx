"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from "lexical";
import { useEffect } from "react";

// Import hàm tạo Node từ file Nodes vừa tách
import { $createImageNode } from "../nodes/ImageNode";

export const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; altText: string }> = createCommand("INSERT_IMAGE_COMMAND");

export function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        const imageNode = $createImageNode(payload.src, payload.altText);
        $insertNodes([imageNode]);
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
