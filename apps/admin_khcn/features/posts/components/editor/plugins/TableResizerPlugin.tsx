"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import { $isTableCellNode } from "@lexical/table";

export function TableResizerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeCell, setActiveCell] = useState<{ elem: HTMLElement; key: string } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizerPos, setResizerPos] = useState({ height: 0, top: 0, left: 0 });

  // 1. Theo dõi chuột để hiển thị thanh kéo
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) return; 

      const target = e.target as HTMLElement;
      const cell = target.closest("td, th") as HTMLElement;

      if (cell) {
        const rect = cell.getBoundingClientRect();
        // Kiểm tra chuột có nằm ở sát mép bên PHẢI của ô không
        if (Math.abs(e.clientX - rect.right) <= 8) {
          
          // --- ĐÃ SỬA LỖI Ở ĐÂY: Dùng editor.read() thay vì editor.getEditorState().read() ---
          editor.read(() => {
            const node = $getNearestNodeFromDOMNode(cell);
            if ($isTableCellNode(node)) {
              setActiveCell({ elem: cell, key: node.getKey() });
              setResizerPos({
                height: rect.height,
                top: rect.top,
                left: rect.right,
              });
            }
          });
          return;
        }
      }
      setActiveCell(null);
    };

    root.addEventListener("mousemove", handleMouseMove);
    return () => root.removeEventListener("mousemove", handleMouseMove);
  }, [editor, isResizing]);

  // 2. Ẩn thanh kéo khi người dùng cuộn chuột
  useEffect(() => {
    const handleScroll = () => {
      if (!isResizing) setActiveCell(null);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [isResizing]);

  // 3. Xử lý sự kiện Kéo thả (Drag & Drop)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeCell) return;
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const initialWidth = activeCell.elem.getBoundingClientRect().width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const diff = moveEvent.clientX - startX;
      const newWidth = Math.max(35, initialWidth + diff); // Chiều rộng tối thiểu 35px
      
      // Chỉnh DOM trực tiếp để giao diện mượt 60fps
      activeCell.elem.style.width = `${newWidth}px`;
      activeCell.elem.style.minWidth = `${newWidth}px`;
      
      setResizerPos(prev => ({ ...prev, left: moveEvent.clientX }));
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      const diff = upEvent.clientX - startX;
      const newWidth = Math.max(35, initialWidth + diff);

      // Lưu kích thước chuẩn vào Lexical State khi nhả chuột
      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(activeCell.elem);
        if ($isTableCellNode(node)) {
          node.setWidth(newWidth);
        }
      });

      setIsResizing(false);
      setActiveCell(null);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  if (!activeCell && !isResizing) return null;

  const resizer = (
    <div
      style={{
        position: "fixed",
        top: resizerPos.top,
        left: resizerPos.left - 3,
        height: resizerPos.height,
        width: "7px",
        cursor: "col-resize",
        backgroundColor: isResizing ? "#3b82f6" : "transparent",
        zIndex: 9999,
      }}
      className="hover:bg-blue-400 transition-colors"
      onMouseDown={handleMouseDown}
    />
  );

  return typeof document !== "undefined" ? createPortal(resizer, document.body) : null;
}
