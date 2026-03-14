"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $getNodeByKey, 
  $getNearestNodeFromDOMNode,
  $createNodeSelection,
  $setSelection,
  $isElementNode
} from "lexical";

import {
  AlignLeft, AlignCenter, AlignRight, Trash2, 
  Settings, Image as ImageIcon, Maximize
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function MediaContextMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  
  const [menuState, setMenuState] = useState<{ x: number; y: number } | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ key: string, isVideo: boolean } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaProps, setMediaProps] = useState({ altText: "", width: "", hasShadow: false });

  // 1. Lắng nghe sự kiện Chuột Phải
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault(); 

        let x = e.clientX;
        let y = e.clientY;
        if (x + 220 > window.innerWidth) x -= 220; 
        if (y + 300 > window.innerHeight) y -= 300; 

        // BẮT BUỘC DÙNG editor.update() VÌ CHÚNG TA ĐANG CAN THIỆP SELECTION
        editor.update(() => {
          const node = $getNearestNodeFromDOMNode(target);
          if (node) {
            // Chủ động tạo vùng chọn (Selection) bao quanh bức ảnh
            const nodeSelection = $createNodeSelection();
            nodeSelection.add(node.getKey());
            $setSelection(nodeSelection);

            setMenuState({ x, y });
            setActiveMedia({ key: node.getKey(), isVideo: target.tagName === "VIDEO" });
            
            setMediaProps({
              altText: target.getAttribute('alt') || "",
              width: target.style.width || `${target.clientWidth}px`,
              hasShadow: target.style.boxShadow && target.style.boxShadow !== 'none' ? true : false
            });
          }
        });
      } else {
        setMenuState(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuState(null);
      }
    };

    const rootElement = editor.getRootElement();
    if (rootElement) {
      rootElement.addEventListener("contextmenu", handleContextMenu);
    }
    window.addEventListener("click", handleClick);

    return () => {
      if (rootElement) rootElement.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("click", handleClick);
    };
  }, [editor]);

  // 2. Hiệu ứng Viền Xanh (Highlight) cho Ảnh/Video đang chọn
  useEffect(() => {
    let targetElement: HTMLElement | null = null;

    if (activeMedia) {
      editor.read(() => {
        const domElement = editor.getElementByKey(activeMedia.key);
        if (domElement) {
          targetElement = (domElement.querySelector('img, video') || domElement) as HTMLElement;
          if (targetElement) {
            targetElement.style.outline = "3px solid #3b82f6"; // Xanh blue-500
            targetElement.style.outlineOffset = "2px";
            targetElement.style.transition = "outline 0.15s ease-in-out";
          }
        }
      });
    }

    // Dọn dẹp viền khi bỏ chọn
    return () => {
      if (targetElement) {
        targetElement.style.outline = "";
        targetElement.style.outlineOffset = "";
      }
    };
  }, [activeMedia, editor]);

  // Reset activeMedia khi cả Menu và Popup đều đóng
  useEffect(() => {
    if (!menuState && !isDialogOpen) {
      setActiveMedia(null);
    }
  }, [menuState, isDialogOpen]);

  // 3. HÀM CĂN LỀ ĐƯỢC FIX LỖI 100% (Điều khiển trực tiếp Node Cha)
  const handleAlign = (alignment: 'left' | 'center' | 'right') => {
    if (!activeMedia) return;
    editor.update(() => {
      const node = $getNodeByKey(activeMedia.key);
      if (node) {
        const parent = node.getParent();
        if ($isElementNode(parent)) {
          parent.setFormat(alignment); // Bắt buộc đoạn văn chứa ảnh phải căn lề
        }
      }
    });
    setMenuState(null);
  };

  // Hàm set kích thước Full 100%
  const handleFullWidth = () => {
    if (!activeMedia) return;
    editor.update(() => {
      const domElement = editor.getElementByKey(activeMedia.key);
      if (domElement) {
        const imgOrVideo = domElement.querySelector('img, video') || domElement;
        if (imgOrVideo instanceof HTMLElement) {
          imgOrVideo.style.width = "100%";
          imgOrVideo.style.height = "auto";
        }
      }
    });
    setMenuState(null);
  };

  // Hàm lưu cấu hình nâng cao
  const handleSaveProperties = () => {
    if (!activeMedia) return;
    
    editor.update(() => {
      const node = $getNodeByKey(activeMedia.key);
      if (node) {
        const domElement = editor.getElementByKey(activeMedia.key);
        if (domElement) {
          const imgOrVideo = domElement.querySelector('img, video') || domElement;
          if (imgOrVideo instanceof HTMLElement) {
            if (mediaProps.width) imgOrVideo.style.width = mediaProps.width;
            
            if (mediaProps.altText && imgOrVideo.tagName === 'IMG') {
              imgOrVideo.setAttribute('alt', mediaProps.altText);
            }

            if (mediaProps.hasShadow) {
              imgOrVideo.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
              imgOrVideo.style.borderRadius = "8px"; 
            } else {
              imgOrVideo.style.boxShadow = "none";
              imgOrVideo.style.borderRadius = "0px";
            }
          }
        }
      }
    });
    setIsDialogOpen(false);
  };

  const MenuItem = ({ icon: Icon, label, onClick, isDestructive }: any) => (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        isDestructive && "text-destructive hover:bg-destructive/10 font-medium"
      )}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );

  return (
    <>
      {/* MENU CHUỘT PHẢI */}
      {menuState && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] min-w-[14rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-80 zoom-in-95"
          style={{ top: menuState.y, left: menuState.x }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {activeMedia?.isVideo ? "Tùy chọn Video" : "Tùy chọn Hình ảnh"}
          </div>
          
          <MenuItem icon={AlignLeft} label="Căn trái" onClick={() => handleAlign("left")} />
          <MenuItem icon={AlignCenter} label="Căn giữa" onClick={() => handleAlign("center")} />
          <MenuItem icon={AlignRight} label="Căn phải" onClick={() => handleAlign("right")} />
          
          <Separator className="my-1" />

          {/* CHỨC NĂNG FULL HÌNH ẢNH MỚI */}
          <MenuItem icon={Maximize} label="Phóng to tràn viền (100%)" onClick={handleFullWidth} />
          
          <MenuItem 
            icon={Settings} 
            label="Tùy chỉnh chi tiết..." 
            onClick={() => {
              setIsDialogOpen(true);
              setMenuState(null); 
            }} 
          />
          
          <Separator className="my-1" />

          <MenuItem 
            icon={Trash2} 
            label="Xóa file này" 
            isDestructive 
            onClick={() => {
              if (activeMedia) {
                editor.update(() => {
                  const node = $getNodeByKey(activeMedia.key);
                  if (node) node.remove();
                });
                setMenuState(null);
              }
            }} 
          />
        </div>,
        document.body
      )}

      {/* DIALOG THUỘC TÍNH */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-[10000]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-600" />
              Thuộc tính {activeMedia?.isVideo ? "Video" : "Hình ảnh"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!activeMedia?.isVideo && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="altText" className="text-right text-xs font-semibold">Văn bản thay thế (Alt SEO)</Label>
                <Input 
                  id="altText" 
                  className="col-span-3 h-8" 
                  value={mediaProps.altText}
                  onChange={(e) => setMediaProps({...mediaProps, altText: e.target.value})}
                  placeholder="Ví dụ: Lãnh đạo tỉnh phát biểu..."
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="width" className="text-right text-xs font-semibold">Độ rộng</Label>
              <Input 
                id="width" 
                className="col-span-3 h-8" 
                value={mediaProps.width}
                onChange={(e) => setMediaProps({...mediaProps, width: e.target.value})}
                placeholder="Ví dụ: 100%, 500px, 20rem..."
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4 mt-2">
              <Label htmlFor="shadow" className="text-right text-xs font-semibold">Đổ bóng nền</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch 
                  id="shadow" 
                  checked={mediaProps.hasShadow}
                  onCheckedChange={(checked) => setMediaProps({...mediaProps, hasShadow: checked})}
                />
                <Label htmlFor="shadow" className="text-xs font-normal text-muted-foreground">
                  (Làm nổi bật hình ảnh trên nền trắng)
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button size="sm" onClick={handleSaveProperties} className="bg-blue-600 hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
