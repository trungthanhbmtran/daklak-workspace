"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode, $getNodeByKey } from "lexical";

export function ImageResizerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeImage, setActiveImage] = useState<{ elem: HTMLElement; key: string } | null>(null);
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isResizing, setIsResizing] = useState(false);

  // 1. Theo dõi click chuột để chọn ảnh
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        editor.read(() => {
          const node = $getNearestNodeFromDOMNode(target);
          if (node) {
            setActiveImage({ elem: target, key: node.getKey() });
            setRect(target.getBoundingClientRect());
          }
        });
      } else {
        // Trừ khi đang bấm vào chính cái nút kéo (resizer)
        if (!(target.closest('.image-resizer-handle'))) {
          setActiveImage(null);
        }
      }
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [editor]);

  // 2. Cập nhật vị trí khung bao quanh ảnh liên tục (khi cuộn chuột hoặc gõ chữ)
  useEffect(() => {
    if (!activeImage || isResizing) return;
    
    let animationFrameId: number;
    const updateRect = () => {
      const newRect = activeImage.elem.getBoundingClientRect();
      if (newRect.top !== rect.top || newRect.left !== rect.left || newRect.width !== rect.width) {
        setRect(newRect);
      }
      animationFrameId = requestAnimationFrame(updateRect);
    };
    
    animationFrameId = requestAnimationFrame(updateRect);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeImage, isResizing, rect]);

  // 3. Logic Kéo Thả (Giữ nguyên tỷ lệ Aspect Ratio)
  const handlePointerDown = (e: React.PointerEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    if (!activeImage) return;
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = activeImage.elem.getBoundingClientRect().width;
    const startHeight = activeImage.elem.getBoundingClientRect().height;
    
    // Tỷ lệ gốc (Khóa tỷ lệ để không bị méo ảnh)
    const ratio = startWidth / startHeight;
    
    // Tìm khung bao ngoài lớn nhất (Editor) để không kéo ảnh tràn lề
    const editorRoot = editor.getRootElement();
    const maxWidth = editorRoot ? editorRoot.clientWidth - 32 : window.innerWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      let deltaX = moveEvent.clientX - startX;
      
      // Nếu kéo góc bên trái (nw, sw) thì di chuyển chuột sang trái (deltaX âm) nghĩa là ảnh to ra
      if (direction === 'nw' || direction === 'sw') {
        deltaX = -deltaX;
      }

      let newWidth = Math.max(100, startWidth + deltaX); // Tối thiểu 100px
      newWidth = Math.min(newWidth, maxWidth); // Tối đa không vượt quá màn hình
      
      const newHeight = newWidth / ratio; // Tự động tính chiều cao để không vỡ hình

      // Cập nhật DOM trực tiếp để siêu mượt
      activeImage.elem.style.width = `${newWidth}px`;
      activeImage.elem.style.height = `${newHeight}px`;
      
      setRect(activeImage.elem.getBoundingClientRect());
    };

    const onPointerUp = () => {
      // Lưu thông số vào Lexical State khi thả chuột
      editor.update(() => {
        const node = $getNodeByKey(activeImage.key);
        if (node) {
          // Ghi đè thuộc tính width/height nếu ImageNode của bạn có hàm này
          if (typeof (node as any).setWidth === 'function') {
            (node as any).setWidth(activeImage.elem.style.width);
            (node as any).setHeight(activeImage.elem.style.height);
          }
        }
      });

      setIsResizing(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (!activeImage) return null;

  // 4. Render 4 điểm neo kéo thả (Corners)
  const HANDLE_SIZE = 10;
  
  const handleStyle: React.CSSProperties = {
    position: "fixed",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    backgroundColor: "#3b82f6", // Màu xanh Blue-500
    border: "2px solid white",
    zIndex: 9999,
  };

  const overlay = (
    <>
      {/* Khung viền xanh bao quanh ảnh báo hiệu đang được chọn */}
      <div 
        style={{
          position: "fixed",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          border: "2px solid #3b82f6",
          pointerEvents: "none",
          zIndex: 9998,
        }}
      />
      
      {/* Góc trên trái */}
      <div 
        className="image-resizer-handle"
        style={{ ...handleStyle, top: rect.top - HANDLE_SIZE/2, left: rect.left - HANDLE_SIZE/2, cursor: "nwse-resize" }}
        onPointerDown={(e) => handlePointerDown(e, 'nw')}
      />
      {/* Góc trên phải */}
      <div 
        className="image-resizer-handle"
        style={{ ...handleStyle, top: rect.top - HANDLE_SIZE/2, left: rect.left + rect.width - HANDLE_SIZE/2, cursor: "nesw-resize" }}
        onPointerDown={(e) => handlePointerDown(e, 'ne')}
      />
      {/* Góc dưới trái */}
      <div 
        className="image-resizer-handle"
        style={{ ...handleStyle, top: rect.top + rect.height - HANDLE_SIZE/2, left: rect.left - HANDLE_SIZE/2, cursor: "nesw-resize" }}
        onPointerDown={(e) => handlePointerDown(e, 'sw')}
      />
      {/* Góc dưới phải */}
      <div 
        className="image-resizer-handle"
        style={{ ...handleStyle, top: rect.top + rect.height - HANDLE_SIZE/2, left: rect.left + rect.width - HANDLE_SIZE/2, cursor: "nwse-resize" }}
        onPointerDown={(e) => handlePointerDown(e, 'se')}
      />
    </>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : null;
}
