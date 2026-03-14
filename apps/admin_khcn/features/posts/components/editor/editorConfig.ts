import { editorTheme } from "./themes/editorTheme"; 
import { EditorNodes } from "./nodes"; 

import {
  HEADING, QUOTE, UNORDERED_LIST, ORDERED_LIST,
  BOLD_ITALIC_STAR, BOLD_ITALIC_UNDERSCORE, STRIKETHROUGH, LINK,
} from "@lexical/markdown";

// export const CUSTOM_TRANSFORMERS = [
//   HEADING, QUOTE, UNORDERED_LIST, ORDERED_LIST,
//   BOLD_ITALIC_STAR, BOLD_ITALIC_UNDERSCORE, STRIKETHROUGH, LINK,
// ];

export const initialConfig = {
  namespace: "VIP_Pro_Editor",
  theme: editorTheme,
  nodes: EditorNodes, 
  onError: (error: Error) => console.error("Lexical Error:", error),
};
