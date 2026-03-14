"use client";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_CRITICAL, PASTE_COMMAND } from "lexical";
import { useEffect } from "react";
import { INSERT_IMAGE_COMMAND } from "./ImagePlugin"; // Đảm bảo đúng đường dẫn

export default function PasteLogPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      PASTE_COMMAND,
      (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData("text/html");
        const items = clipboardData.items;

        console.log("=== KIỂM TRA CLIPBOARD CHI TIẾT ===");
        console.log("- HTML Data:", html ? "CÓ" : "KHÔNG");
        console.log("- Các kiểu dữ liệu hiện có:", Array.from(clipboardData.types));

        // TRƯỜNG HỢP 1: NẾU CÓ HTML (Sẽ để Lexical tự xử lý qua importDOM)
        if (html) {
          console.log("👉 Đang để Lexical tự dịch HTML...");
          return false; 
        }

        // TRƯỜNG HỢP 2: NẾU KHÔNG CÓ HTML, KIỂM TRA XEM CÓ PHẢI FILE ẢNH KHÔNG
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              console.log("📸 PHÁT HIỆN FILE ẢNH TRONG CLIPBOARD!");
              
              // Tạo một đường dẫn tạm thời để hiển thị ảnh ngay lập tức
              const imageUrl = URL.createObjectURL(file);
              
              // Gọi lệnh chèn ảnh của bạn
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                src: imageUrl,
                altText: "Ảnh từ Clipboard",
              });

              event.preventDefault(); // Chặn việc dán text rác
              return true; // Đã xử lý xong
            }
          }
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}
